import 'dotenv/config'
import JiraIssueChecker from './src/JiraIssueChecker.js'


(async () => {
  const jiraIssueChecker = new JiraIssueChecker()
  await jiraIssueChecker.run()
})()