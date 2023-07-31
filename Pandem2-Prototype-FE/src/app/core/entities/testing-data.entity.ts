/*
  Copyright Clarisoft, a Modus Create Company, 20/07/2023, licensed under the
  EUPL-1.2 or later. This open-source code is licensed following the Attribution
  4.0 International (CC BY 4.0) - Creative Commons — Attribution 4.0 International
  — CC BY 4.0.

  Following this, you are accessible to:

  Share - copy and redistribute the material in any medium or format.
  Adapt - remix, transform, and build upon the material commercially.

  Remark: The licensor cannot revoke these freedoms if you follow the license
  terms.

  Under the following terms:

  Attribution - You must give appropriate credit, provide a link to the license,
  and indicate if changes were made. You may do so reasonably but not in any way
  that suggests the licensor endorses you or your use.
  No additional restrictions - You may not apply legal terms or technological
  measures that legally restrict others from doing anything the license permits.
*/
export const TestTotalTypeValues = {
  Absolute: 'Absolute',
  per100k: '100K'
};
type totalType = typeof TestTotalTypeValues;
export type TestTotalType = totalType[keyof totalType];

export const TestSplitTypeValues = {
  TestType: 'test_type',
  TestResult: 'test_result'
};

type testSplitType = typeof TestSplitTypeValues;
export type TestSplitType = testSplitType[keyof testSplitType];

export const TestTypeValues = {
  NAATs: 'NAATs',
  Antigen: 'Antigen',
  Unknown: 'Unknown'
};
type testType = typeof TestTypeValues;
export type TestType = testType[keyof testType];

export const TestResultsValues = {
  Positive: 'Positive'
};
type testResult = typeof TestResultsValues;
export type TestResult = testResult[keyof testResult];

export const TestSubcategoryValues = {
  TestsPerformed: 'Tests Performed',
  PositivityRate: 'Positivity Rate',
  TestingPolicy: 'Testing Policy'
};
type testSubcategory = typeof TestResultsValues;
export type TestSubcategory = testSubcategory[keyof testSubcategory];

export const TestingPolicyValues = {
  NoPolicy: 'No Policy'
};
type testingPolicy = typeof TestingPolicyValues;
export type TestingPolicy = testingPolicy[keyof testingPolicy];

export interface ITestLocation {
  reference: string;
  value: string;
}

export interface TestingDataEntity {
  pathogen: string;
  subcategory: TestSubcategory;
  date: Date;
  total: number;
  isDateTotal?: boolean;
  totalType: TestTotalType;
  location: ITestLocation;
  testType?: TestType;
  testResult?: TestResult;
}


