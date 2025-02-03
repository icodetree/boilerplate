import path from "path";
import through2 from "through2";

import {
  __dirname,
  projectDirName,
  isBuild,
  destFolder,
  srcFolder,
  projectPaths,
  projectReplacePaths,
} from "./paths.js";

// 상대 경로 or 절대 경로 계산 함수
function getRelativePath(from, to) {
  if (isBuild) {
    // isBuild가 true일 경우, 절대 경로 반환
    // const srcDirPath = path.resolve(__dirname, srcFolder); // 프로젝트의 'src' 폴더 절대 경로를 구함
    // const absolutePath = path.resolve(__dirname, to); // 'to' 경로의 절대 경로를 구함
    // let relativePath = path.relative(srcDirPath, absolutePath); // 'src' 폴더를 기준으로 한 'to' 경로의 상대 경로를 구함
    // relativePath = "/" + relativePath.replace(/\\/g, "/"); // 경로 앞에 '/'를 붙이고, 모든 '\'를 '/'로 변경
    // return relativePath;

    // isBuild가 true일 경우, 상대 경로 반환
    return path.relative(path.dirname(from), to).replace(/\\/g, "/");
  } else {
    // 그렇지 않을 경우, 상대 경로 반환
    return path.relative(path.dirname(from), to).replace(/\\/g, "/");
  }
}

// paths.js 의 경로를 가져옵니다.
const commonPatterns = projectReplacePaths;

// 개선된 버전
export function replacePathPatterns() {
  return through2.obj(function (file, enc, callback) {
    if (file.isStream()) {
      this.emit(
        "error",
        new PluginError("replacePathPatterns", "Streams not supported!"),
      );
      return callback();
    }

    if (file.isBuffer()) {
      let contents = file.contents.toString(enc);

      // 더 효율적인 변환 대상 키 검사: 실제 변환할 필요가 있는 키만 필터링합니다.
      const transformKeys = Object.keys(commonPatterns).filter((key) =>
        contents.includes(key),
      );
      if (transformKeys.length === 0) {
        this.push(file); // 변환할 패턴이 없으면, 처리를 건너뜁니다.
        return callback();
      }

      const sortedKeys = transformKeys.sort((a, b) => b.length - a.length);
      let processedContents = contents;

      sortedKeys.forEach((key) => {
        const pattern = new RegExp(`\\b${key}(\\/|\\.[a-zA-Z]+)\\b`, "g");
        processedContents = processedContents.replace(pattern, (match) => {
          const replacementPath = `./${srcFolder}/${commonPatterns[key]}`;
          const relativePath = getRelativePath(
            file.path,
            replacementPath,
          ).replace(/\\/g, "/");
          return match.replace(key, relativePath);
        });
      });

      file.contents = Buffer.from(processedContents, enc);
    }

    this.push(file);
    callback();
  });
}

// task에서 사용하는 코드들
// import { replacePathPatterns } from "../config/replacePathPatterns.js"; // 추가된 import 문

// 여기에서 replacePathPatterns 함수를 사용
// .pipe(replacePathPatterns())
