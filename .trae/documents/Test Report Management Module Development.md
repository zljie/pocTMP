I have completed the development of the "Test Report Management" module under the "Interface Test" menu.

**Summary of Changes:**
1.  **Menu Update**: Modified `src/components/layout/MainLayout.tsx` to add "测试报告管理" (Test Report Management) under the "Interface Test" submenu.
2.  **New Page**: Created `src/app/api-testing/test-reports/page.tsx` implementing the required features:
    *   **Layout**: Consistent with "Interface Management" using `MainLayout` and Ant Design components.
    *   **List View**: Displays test reports with columns for Test Set, Counts (Scene, Success, Failure, Exception, Skip), Progress, Time, Tester, Project, etc.
    *   **Query**: Implemented search by "Test Set Name".
    *   **Detail View**: Clicking on any of the count tags opens a modal showing detailed test scenarios and their results (Success, Failure, Exception, etc.), matching the prototype.
    *   **Delete**: Implemented single record delete with confirmation.
    *   **Batch Delete**: Implemented batch delete with checkbox selection and confirmation.

**Verification:**
*   Code passes linting checks.
*   Structure and styling match the provided screenshots and existing "Interface Management" module.
*   Functionality (Search, Delete, View Details) is implemented with React state and mock data, ready for API integration.