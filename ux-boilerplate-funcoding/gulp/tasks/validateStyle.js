import gulp from "gulp";
import postcss from "gulp-postcss";
import postcssScss from "postcss-scss"; // SCSS 구문 분석을 위한 PostCSS 플러그인
import stylelint from "stylelint";
import reporter from "postcss-reporter";

import { plugins } from "../config/plugins.js";
import { logger } from "../config/Logger.js";
import { __dirname, projectDirName, isBuild, destFolder, srcFolder, projectPaths } from "../config/paths.js";

// 참고 URL
// https://stylelint.io/

const validateStyle = () => {
  return gulp.src(projectPaths.styleValidationSrc).pipe(
    postcss(
      [
        stylelint(),
        reporter({
          clearReportedMessages: true,
          throwError: false, // 에러가 발생하면 Gulp 작업을 실패시킵니다.
        }),
      ],
      {
        syntax: postcssScss, // SCSS 파일을 처리하기 위해 구문 분석기로 postcss-scss를 지정합니다.
      }
    )
  );
  // .pipe(gulp.dest("./reports")); // 결과를 reports 폴더에 저장합니다 (선택적)
};

export { validateStyle };
