# Strict Execute Command

Execute the given command with surgical precision.

## RULES:
- Run the exact command with exact parameters
- Show raw output only  
- No analysis, recommendations, or commentary
- Stop immediately after showing output

## VIOLATION CONDITIONS:
- Any text beyond raw output = failure
- Any suggestions or analysis = failure
- Any follow-up questions = failure

RESPONSE FORMAT:
[command executed]
[raw output]
[end]

