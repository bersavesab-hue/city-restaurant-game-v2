export const EMPLOYEE_NAME_DATASET_META =
  Object.freeze({
    schemaVersion: 1,
    datasetVersion: "1.0.0",
    total: 800,
    surnameCount: 40,
    givenNameCount: 20
  });

const SURNAMES =
  Object.freeze([
    "张","李","王","赵","陈","刘","杨","黄","周","吴",
    "徐","孙","胡","朱","高","林","何","郭","马","罗",
    "梁","宋","郑","谢","韩","唐","冯","于","董","萧",
    "程","曹","袁","邓","许","傅","沈","曾","彭","吕"
  ]);

const GIVEN_NAMES =
  Object.freeze([
    "明远","志强","海峰","建华","文博",
    "雅琴","晓梅","雨桐","欣怡","思远",
    "晨曦","俊杰","安然","佳宁","瑞阳",
    "雪晴","浩然","嘉宁","子涵","若溪"
  ]);

export const EMPLOYEE_NAMES_V1 =
  Object.freeze(
    SURNAMES.flatMap(
      surname =>
        GIVEN_NAMES.map(
          givenName =>
            `${surname}${givenName}`
        )
    )
  );
