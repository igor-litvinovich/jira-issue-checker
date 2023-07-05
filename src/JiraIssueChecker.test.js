import { jest } from '@jest/globals';
import JiraIssueChecker from './JiraIssueChecker.js';
import axios from 'axios';
jest.mock('axios');

describe('JiraIssueChecker', () => {
    let jiraIssueChecker;
    beforeEach(() => {
        jiraIssueChecker = new JiraIssueChecker();
    });

    describe('getComponentsWithoutLead', () => {
        it('should fetch components and return those without a lead', async () => {
            const components = [
                { name: 'Component1', lead: { name: 'Lead1' } },
                { name: 'Component2' }
            ];
            axios.get = jest.fn(() => ({ data: components }))

            const result = await jiraIssueChecker.getComponentsWithoutLead();

            expect(axios.get).toHaveBeenCalled()
            expect(result).toEqual([{ name: 'Component2' }]);
        });
    });

    describe('countIssuesForComponents', () => {
        it('should correctly count the number of issues for each component', () => {
            const issues = [
                { fields: { components: [{ name: 'Component1' }] } },
                { fields: { components: [{ name: 'Component1' }, { name: 'Component2' }] } }
            ];
            jiraIssueChecker.componentIssueCounts = new Map([
                ['Component1', 0],
                ['Component2', 0]
            ]);

            jiraIssueChecker.countIssuesForComponents(issues);

            expect(jiraIssueChecker.componentIssueCounts.get('Component1')).toBe(2);
            expect(jiraIssueChecker.componentIssueCounts.get('Component2')).toBe(1);
        });
    });
});
