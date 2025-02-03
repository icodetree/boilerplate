import gulp from "gulp";
import path from "path";
import through2 from "through2";
import chalk from "chalk";
import { w3cHtmlValidator } from "w3c-html-validator";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { plugins } from "../config/plugins.js";
import { logger } from "../config/Logger.js";
import {
  __dirname,
  projectDirName,
  isBuild,
  destFolder,
  srcFolder,
  projectPaths,
} from "../config/paths.js";

const argv = yargs(hideBin(process.argv)).argv;

// SSL 인증서 검증 비활성화 (로컬 개발 환경에서만 사용)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// 참고 URL
// https://github.com/center-key/w3c-html-validator/blob/main/w3c-html-validator.ts
// https://www.npmjs.com/package/w3c-html-validator

const validateHtml = () => {
  // 검사할 HTML 파일 경로를 CLI 인자를 통해 받은 폴더로 설정
  const folder = argv.folder
    ? `${argv.folder}/**/*.html`
    : projectPaths.htmlValidationSrc;

  // 스트림을 통해 파일을 처리합니다.
  return gulp
    .src(folder) // 검사할 HTML 파일 경로 설정
    .pipe(
      through2.obj(function (file, _, cb) {
        if (file.isBuffer()) {
          console.log(
            `${chalk.hex("#FF0000")("<-------------------- s: 검사 --------------------> ")}`,
          );
          console.log(
            `${chalk.hex("#FFFFFF")("원본소스(src): " + path.basename(file.path))}`,
          );
          console.log(
            `${chalk.hex("#FFFFFF")("검사소스(dist): " + file.path)}`,
          );

          const options = {
            // 옵션 설정
            html: file.contents.toString(),
            checkUrl: "https://validator.w3.org/nu/",
            ignoreLevel: "warning", // null < info < warning
            ignoreMessages: [], // 특정 메시지 무시
            output: "json", // 'json' 또는 'html' 출력 형식
          };

          w3cHtmlValidator
            .validate(options)
            .then((results) => {
              const reportOptions = {
                // 리포터 옵션 설정
                continueOnFail: true, // 실패해도 계속 진행
                maxMessageLen: null, // 메시지 최대 길이
                quiet: false, // 성공 메시지 억제
                title: null, // 보고서 제목
              };
              w3cHtmlValidator.reporter(results, reportOptions);
              console.log(
                `${chalk.hex("#FF0000")("<-------------------- e: 검사 --------------------> ")}`,
              );
              console.log(); // 여기에 한 줄 띄움
              cb(null, file);
            })
            .catch((error) => {
              console.error("Validation error:", error);
              cb(error);
            });
        } else {
          // 파일이 버퍼가 아닌 경우, 파일을 그대로 다음 단계로 전달합니다.
          cb(null, file);
        }
      }),
    );
};

export { validateHtml };
