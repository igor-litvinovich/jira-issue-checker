import axios from 'axios';
import fs from 'fs';

const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
const PROJECT_KEY = process.env.PROJECT_KEY;
const MAX_RESULTS = Number.parseInt(process.env.MAX_RESULTS);

class JiraIssueChecker {
    constructor() {
        this.componentIssueCounts = new Map();
    }

    async getComponentsWithoutLead() {
        try {
            const response = await axios.get(`${JIRA_BASE_URL}/project/${PROJECT_KEY}/components`);
            return response.data.filter(component => !component.lead);
        } catch (error) {
            console.error('Error fetching components:', error);
        }
    }

    async getIssues(startAt = 0) {
        try {
            const response = await axios.get(`${JIRA_BASE_URL}/search`, {
                params: {
                    jql: `project=${PROJECT_KEY}`,
                    fields: 'components',
                    maxResults: MAX_RESULTS,
                    startAt
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching issues:', error);
        }
    }

    countIssuesForComponents(issues) {
        issues.forEach(issue => {
            issue.fields.components.forEach(component => {
                if (this.componentIssueCounts.has(component.name)) {
                    const currentCount = this.componentIssueCounts.get(component.name);
                    this.componentIssueCounts.set(component.name, currentCount + 1);
                }
            });
        });
    }

    async run() {
        const componentsWithoutLead = await this.getComponentsWithoutLead();

        if (!componentsWithoutLead || componentsWithoutLead.length === 0) {
            console.log('All components have a lead assigned');
            return;
        }

        componentsWithoutLead.forEach(component => {
            this.componentIssueCounts.set(component.name, 0);
        });

        let startAt = 0;
        let totalIssues;

        do {
            const issuesResponse = await this.getIssues(startAt);
            const { issues, total } = issuesResponse;
            totalIssues = total;

            this.countIssuesForComponents(issues);

            startAt += MAX_RESULTS;
        } while (startAt < totalIssues);

        this.printResults();
    }

    printResults() {
        const outputLines = ['Components with no lead:', '--------------------------'];

        for (const [component, issueCount] of this.componentIssueCounts) {
            const line = `${component}: ${issueCount} issue(s)`;
            outputLines.push(line);
            console.log(line);
        }

        fs.writeFileSync('output.txt', outputLines.join('\n'));
        console.log('\nResults have been saved to ./output.txt');
    }
}

export default JiraIssueChecker;