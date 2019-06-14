import { Handler } from "laya/utils/Handler";
import { BaseTexture } from "laya/resource/BaseTexture";
/**
 * <code>TextureCube</code> 类用于生成立方体纹理。
 */
export declare class TextureCube extends BaseTexture {
    /**TextureCube资源。*/
    static TEXTURECUBE: string;
    /**灰色纯色纹理。*/
    static grayTexture: TextureCube;
    /**
     * @private
     */
    static __init__(): void;
    /**
     * @inheritDoc
     */
    static _parse(data: any, propertyParams?: any, constructParams?: any[]): TextureCube;
    /**
     * 加载TextureCube。
     * @param url TextureCube地址。
     * @param complete 完成回调。
     */
    static load(url: string, complete: Handler): void;
    /** @private */
    private _premultiplyAlpha;
    /**
     * @inheritDoc
     */
    readonly defaulteTexture: BaseTexture;
    /**
     * 创建一个 <code>TextureCube</code> 实例。
     * @param	format 贴图格式。
     * @param	mipmap 是否生成mipmap。
     */
    constructor(format?: number, mipmap?: boolean);
    /**
     * 通过六张图片源填充纹理。
     * @param 图片源数组。
     */
    setSixSideImageSources(source: any[], premultiplyAlpha?: boolean): void;
    /**
     * 通过六张图片源填充纹理。
     * @param 图片源数组。
     */
    setSixSidePixels(width: number, height: number, pixels: any[]): void;
    /**
     * @inheritDoc
     */
    protected _recoverResource(): void;
}