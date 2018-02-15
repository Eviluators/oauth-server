const Airtable = require('airtable');
const apiKey = process.env.AIRTABLE_API_KEY;
const root = process.env.AIRTABLE_ROOT;

const Student = new Airtable({ apiKey }).base(root)('Students');
const Test_Result = new Airtable({ apiKey }).base(root)('Test Results');

const queries = {
  getStudent: async username => {
    try {
      const query = Student.select({
        maxRecords: 1,
        filterByFormula: `{Github Username} = "${username}"`
      });
      const results = await query.firstPage();
      return results[0];
    } catch (error) {
      throw new Error(error);
    }
  },
  getStudentWithTestResults: async username => {
    try {
      const studentQuery = Student.select({
        maxRecords: 1,
        filterByFormula: `{Github Username} = "${username}"`
      });
      const studentResult = await studentQuery.firstPage();
      // NOTE: This query on the Test Result table will only return 100 results due
      // to airtable's pagination -- to be fully production ready we would need to
      // account for this and re-query for the next pages if the results exceeded
      // 100 records
      const testResultsQuery = Test_Result.select({
        filterByFormula: `{Student Record ID} = "${studentResult[0].id}"`
      });
      const testResults = await testResultsQuery.firstPage();
      const trData = testResults.map(tr => tr.fields);
      const sData = studentResult[0].fields;
      sData['Test Results'] = trData;
      return sData;
    } catch (error) {
      console.log(error);
    }
  }
};

module.exports = queries;
