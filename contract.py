# v0.1.1
# { "Depends": "py-genlayer:latest" }

from genlayer import *
import json
import typing


class ModerationRegistry(gl.Contract):
    # Flattened storage - case_id directly maps to case data string (JSON)
    cases: TreeMap[str, str]  # case_id -> JSON string of case data
    case_owners: TreeMap[str, Address]  # case_id -> owner address
    reputation: TreeMap[Address, u256]  # arbiter -> reputation points
    case_counter: u256

    def __init__(self):
        """
        Initializes the moderation registry.
        """
        self.case_counter = u256(0)

    @gl.public.write
    def file_report(self, incident_report: str, community_rules: str):
        """
        Files a new incident report for moderation.
        
        Args:
            incident_report (str): Detailed description of the reported behavior.
            community_rules (str): The set of rules allegedly violated.
        """
        owner = gl.message.sender_address
        
        # Generate unique case ID
        self.case_counter += u256(1)
        case_id = f"case_{self.case_counter}"
        
        # Create the case data as JSON string
        case_data = {
            "id": case_id,
            "incident": incident_report,
            "rules": community_rules,
            "verdict": "Pending",
            "reasoning": "",
            "status": "Under Review",
            "resolved": False,
            "reporter": owner.as_hex
        }
        
        # Store as JSON string
        self.cases[case_id] = json.dumps(case_data)
        self.case_owners[case_id] = owner

    @gl.public.write
    def arbitrate(self, case_id: str):
        """
        Triggers GenLayer's consensus to evaluate a specific case.
        
        Args:
            case_id (str): The ID of the case to arbitrate
        """
        # Check if case exists
        if case_id not in self.cases:
            return
        
        # Get case data
        case_json = self.cases[case_id]
        case_data = json.loads(case_json)
        
        if case_data["resolved"]:
            return
        
        report = case_data["incident"]
        rules = case_data["rules"]
        
        def get_llm_verdict() -> typing.Any:
            task = f"""
You are a neutral community arbitrator. 
Evaluate the following incident report based strictly on the community rules provided.

Community Rules:
{rules}

Incident Report:
{report}

Respond ONLY with a JSON object in this exact format:
{{
    "verdict": "Dismissed",
    "reasoning": "A short, 1-2 sentence explanation of the decision based on the rules.",
    "resolved": true
}}

The verdict must be one of: "Dismissed", "Warning", "Temporary Ban", or "Permanent Ban"

It is mandatory that you respond only using the JSON format above, nothing else. 
Don't include any other words or characters, your output must be only JSON 
without any formatting prefix or suffix. This result should be perfectly 
parsable by a JSON parser without errors.
            """
            
            result = gl.nondet.exec_prompt(task).replace("```json", "").replace("```", "").strip()
            return json.loads(result)
        
        # GenLayer ensures multiple nodes agree on this LLM output
        final_decision = gl.eq_principle.strict_eq(get_llm_verdict)
        
        if final_decision.get("resolved"):
            case_data["resolved"] = True
            case_data["verdict"] = final_decision["verdict"]
            case_data["reasoning"] = final_decision["reasoning"]
            case_data["status"] = "Resolved"
            
            # Update the case in storage
            self.cases[case_id] = json.dumps(case_data)
            
            # Award reputation points to the arbitrator (caller)
            arbitrator = gl.message.sender_address
            
            # Award points based on verdict severity
            points_awarded = u256(10)  # Base points for arbitration
            if final_decision["verdict"] == "Permanent Ban":
                points_awarded = u256(20)
            elif final_decision["verdict"] == "Temporary Ban":
                points_awarded = u256(15)
            elif final_decision["verdict"] == "Warning":
                points_awarded = u256(10)
            else:  # Dismissed
                points_awarded = u256(5)
            
            current_rep = self.reputation.get(arbitrator, u256(0))
            self.reputation[arbitrator] = current_rep + points_awarded

    @gl.public.view
    def get_cases(self) -> str:
        """
        Returns all cases in the registry as JSON.
        
        Returns:
            str: JSON string of all cases organized by owner
        """
        all_cases = {}
        
        for case_id in self.cases.keys():
            case_data = json.loads(self.cases[case_id])
            owner = case_data["reporter"]
            
            if owner not in all_cases:
                all_cases[owner] = {}
            
            all_cases[owner][case_id] = case_data
        
        return json.dumps(all_cases)

    @gl.public.view
    def get_reputation(self) -> str:
        """
        Returns the reputation points for all arbiters as JSON.
        
        Returns:
            str: JSON string mapping arbiter addresses to their reputation points
        """
        all_reputation = {}
        
        for arbiter_addr in self.reputation.keys():
            all_reputation[arbiter_addr.as_hex] = int(self.reputation[arbiter_addr])
        
        return json.dumps(all_reputation)

    @gl.public.view
    def get_arbiter_reputation(self, arbiter_address: str) -> int:
        """
        Get reputation points for a specific arbiter.
        
        Args:
            arbiter_address (str): The arbiter's address as hex string
            
        Returns:
            int: Reputation points (0 if not found)
        """
        addr = Address(arbiter_address)
        return int(self.reputation.get(addr, u256(0)))
