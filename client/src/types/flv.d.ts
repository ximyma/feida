// flv.js 类型声明
declare module 'flv.js' {
  export interface FLVJS {
    createPlayer(mediaDataSource: any, config?: any): any;
    isSupported(): boolean;
  }

  const flvjs: FLVJS;
  export default flvjs;

  export namespace flvjs {
    function createPlayer(mediaDataSource: any, config?: any): any;
    function isSupported(): boolean;
    function getFeatureList(): string[];
  }
}
