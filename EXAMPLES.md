# Usage Examples

This document provides practical examples of how to use the n8n MCP server with Claude or OpenCode.

## Basic Workflow Operations

### Listing Workflows

**Prompt:**
```
Show me all my n8n workflows
```

**What happens:**
- MCP server calls `n8n_search_workflows`
- Returns list of workflows with ID, name, and status

**Output:**
```json
[
  {
    "id": "abc123",
    "name": "Email Processor",
    "active": true,
    "tags": ["email", "automation"]
  },
  {
    "id": "def456",
    "name": "Data Sync",
    "active": false,
    "tags": ["database", "sync"]
  }
]
```

### Searching Workflows

**Prompt:**
```
Find all workflows related to Slack
```

**What happens:**
- Searches workflow names and tags for "Slack"
- Returns matching workflows

### Getting Workflow Details

**Prompt:**
```
Show me the details of workflow "Email Processor"
```

**Alternative:**
```
Get workflow abc123 configuration
```

**What happens:**
- Retrieves complete workflow definition including all nodes, connections, and settings

## Executing Workflows

### Simple Execution

**Prompt:**
```
Execute the "Data Sync" workflow
```

**What happens:**
- Finds workflow by name
- Executes it without additional input
- Returns execution ID and status

### Execution with Input Data

**Prompt:**
```
Execute workflow "Customer Webhook" with this data:
{
  "email": "customer@example.com",
  "action": "signup",
  "plan": "pro"
}
```

**What happens:**
- Executes workflow with provided JSON data
- Workflow receives data in first node
- Returns execution result

### Checking Execution Status

**Prompt:**
```
What's the status of execution xyz789?
```

**What happens:**
- Retrieves execution details
- Shows success/failure, timing, and any errors

## Creating Workflows

### Simple Webhook Workflow

**Prompt:**
```
Create a new n8n workflow called "GitHub Webhook Handler" that:
1. Receives webhook data from GitHub
2. Parses the event type
3. Sends a notification to Slack
4. Logs the event to a database
```

**What Claude does:**
1. Asks clarifying questions about:
   - Slack webhook URL
   - Database connection details
   - Which GitHub events to handle
2. Designs the node structure
3. Calls `n8n_create_workflow` with complete configuration

### Schedule-based Workflow

**Prompt:**
```
Create a workflow that runs every day at 9 AM and:
1. Fetches data from an API endpoint
2. Processes the data
3. Saves results to Google Sheets
```

**What Claude does:**
1. Creates a Cron trigger node (0 9 * * *)
2. Adds HTTP Request node for API
3. Adds data processing nodes
4. Adds Google Sheets node
5. Configures all connections

### Manual Trigger Workflow

**Prompt:**
```
Create a simple workflow that I can trigger manually to send myself a test email
```

**Result:**
```json
{
  "name": "Test Email Sender",
  "nodes": [
    {
      "name": "Manual Trigger",
      "type": "n8n-nodes-base.manualTrigger",
      "position": [250, 300]
    },
    {
      "name": "Send Email",
      "type": "n8n-nodes-base.emailSend",
      "position": [450, 300],
      "parameters": {
        "toEmail": "your@email.com",
        "subject": "Test Email",
        "text": "This is a test email from n8n"
      }
    }
  ],
  "connections": {
    "Manual Trigger": {
      "main": [[{"node": "Send Email", "type": "main", "index": 0}]]
    }
  }
}
```

## Modifying Workflows

### Updating Workflow Name

**Prompt:**
```
Rename workflow abc123 to "Production Email Handler"
```

**What happens:**
```javascript
n8n_update_workflow({
  workflowId: "abc123",
  name: "Production Email Handler"
})
```

### Activating/Deactivating

**Prompt:**
```
Activate the "Data Sync" workflow
```

**What happens:**
```javascript
n8n_update_workflow({
  workflowId: "def456",
  active: true
})
```

### Adding a Node

**Prompt:**
```
Add a Slack notification node to the end of workflow abc123 that sends to #general channel
```

**What Claude does:**
1. Gets current workflow configuration
2. Adds new Slack node to nodes array
3. Updates connections to link last node to new Slack node
4. Calls `n8n_update_workflow` with updated configuration

### Modifying Node Parameters

**Prompt:**
```
In workflow "Email Processor", change the email subject line to "New Order Received"
```

**What Claude does:**
1. Gets workflow details
2. Finds the email node
3. Updates the subject parameter
4. Saves the modified workflow

## Debugging Workflows

### Analyzing Failed Execution

**Prompt:**
```
Why did execution xyz789 fail?
```

**What Claude does:**
1. Retrieves execution details with `n8n_get_execution_details`
2. Analyzes error messages
3. Identifies which node failed
4. Explains the issue
5. Suggests fixes

**Example output:**
```
The execution failed at the "HTTP Request" node with error:
"ECONNREFUSED - Connection refused"

This indicates the API endpoint is not reachable. Possible causes:
1. The API service is down
2. The URL is incorrect
3. Firewall is blocking the connection
4. The port number is wrong

Suggested fixes:
- Verify the API URL is correct
- Check if the API service is running
- Test the endpoint with curl manually
```

### Getting Recent Executions

**Prompt:**
```
Show me the last 10 executions of workflow "Data Sync"
```

**What happens:**
```javascript
n8n_get_executions({
  workflowId: "def456",
  limit: 10
})
```

**Output:**
```json
[
  {
    "id": "exec1",
    "startedAt": "2024-02-04T10:00:00Z",
    "status": "success",
    "finished": true
  },
  {
    "id": "exec2",
    "startedAt": "2024-02-04T09:00:00Z",
    "status": "error",
    "finished": true
  }
]
```

### Filtering Failed Executions

**Prompt:**
```
Show me only failed executions for workflow abc123 from the last day
```

## Using Prompts

### Guided Workflow Creation

**Prompt:**
```
Use the create_simple_workflow prompt with workflow_type="webhook"
```

**What happens:**
- Triggers predefined prompt
- Claude asks structured questions about your webhook workflow
- Guides you through each step
- Creates the workflow once all info is gathered

### Workflow Analysis

**Prompt:**
```
Use the analyze_workflow prompt for workflow abc123
```

**What Claude provides:**
1. **Overview:** What the workflow does
2. **Strengths:** Well-designed aspects
3. **Improvements:** Optimization suggestions
4. **Security:** Potential security issues
5. **Error Handling:** How errors are managed
6. **Maintainability:** Code organization tips

### Execution Debugging

**Prompt:**
```
Use the debug_workflow prompt for execution xyz789
```

**What Claude provides:**
1. **Error Location:** Which node failed
2. **Root Cause:** Why it failed
3. **Immediate Fix:** Quick solution
4. **Prevention:** How to avoid in future
5. **Monitoring:** Suggested alerts to add

## Advanced Examples

### Bulk Workflow Operations

**Prompt:**
```
Find all inactive workflows tagged "test" and delete them
```

**What Claude does:**
1. Searches for workflows with tag "test" and active=false
2. Lists found workflows
3. Asks for confirmation
4. Deletes each workflow

### Workflow Migration

**Prompt:**
```
Copy workflow abc123 and create a modified version that sends to Slack instead of email
```

**What Claude does:**
1. Gets source workflow
2. Identifies email node
3. Replaces with Slack node
4. Adjusts connections
5. Creates new workflow with modified configuration

### Batch Execution

**Prompt:**
```
Execute workflow "User Notification" for each user in this list:
- alice@example.com
- bob@example.com
- charlie@example.com
```

**What Claude does:**
1. Loops through user list
2. Executes workflow for each user with appropriate input
3. Collects all execution IDs
4. Reports success/failure for each

### Workflow Comparison

**Prompt:**
```
Compare workflows abc123 and def456 and tell me the differences
```

**What Claude does:**
1. Retrieves both workflows
2. Compares node types and count
3. Identifies different triggers
4. Lists unique nodes in each
5. Suggests which is better for specific use cases

## Integration with Development Workflow

### CI/CD Integration

**Prompt:**
```
Create a workflow that triggers when I push to GitHub main branch and:
1. Runs tests
2. Deploys to staging
3. Notifies team in Slack
```

### Automated Testing

**Prompt:**
```
Execute the "Test API Endpoints" workflow and verify all responses are successful
```

### Monitoring Setup

**Prompt:**
```
Create a workflow that runs every 5 minutes to check if our API is responding and alerts if it's down
```

## Tips for Best Results

### Be Specific
❌ "Fix my workflow"
✅ "Workflow abc123 is failing at the HTTP Request node with timeout error. Can you increase the timeout to 30 seconds?"

### Provide Context
❌ "Execute workflow"
✅ "Execute the 'Customer Onboarding' workflow with email=new@customer.com and plan=premium"

### Use Workflow Names or IDs
✅ "Update workflow 'Email Handler'"
✅ "Update workflow abc123"

### Iterate
1. Start with simple request
2. Review the result
3. Request refinements
4. Test the workflow

### Leverage Prompts
Instead of describing everything from scratch, use built-in prompts:
- `create_simple_workflow` for guided creation
- `analyze_workflow` for optimization
- `debug_workflow` for troubleshooting

## Common Patterns

### Daily Report Workflow
```
Create a workflow that:
- Triggers daily at 8 AM
- Queries database for yesterday's metrics
- Formats data into a report
- Emails report to management
- Posts summary to Slack
```

### Customer Onboarding
```
Create a workflow triggered by webhook that:
- Validates customer data
- Creates account in database
- Sends welcome email
- Adds to CRM
- Notifies sales team
```

### Error Alert System
```
Create a workflow that:
- Monitors application logs
- Detects error patterns
- Aggregates similar errors
- Sends alert to PagerDuty
- Creates Jira ticket
```

## Next Steps

1. **Start Simple:** Begin with listing and executing existing workflows
2. **Explore:** Use prompts to analyze your workflows
3. **Create:** Build simple workflows with guidance
4. **Iterate:** Modify and improve workflows
5. **Automate:** Create complex multi-step automation

For more information, see [README.md](README.md) and [CONFIGURATION.md](CONFIGURATION.md).
