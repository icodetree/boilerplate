import { defineConfig } from 'vite';

export default defineConfig({
  // additionalData 옵션은 Sass 파일을 컴파일할 때 추가적인 데이터를 전달하는 데 사용됩니다. 
  // 이 옵션은 주로 변수, 믹스인, 함수 등을 전역적으로 사용하기 위해 사용됩니다.
  css: {
    preprocessorOptions: {
      scss: {
        // additionalData: `@import "./src/assets/scss/main.scss";`,
      },
    },
    devSourcemap: true,
  },
  build: {
    outDir: 'dist',
  },
});