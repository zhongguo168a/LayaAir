import { QGMiniAdapter } from "./QGMiniAdapter";
import { MiniFileMgr } from "./MiniFileMgr";
import {URL} from "laya/net/URL";	
import { Handler } from "laya/utils/Handler";
import { Browser } from "laya/utils/Browser";
import { HTMLImage } from "laya/resource/HTMLImage";
import {Event} from "laya/events/Event";
	/** @private **/
	export class MiniImage {
		
		/**@private **/
		protected _loadImage(url:string):void {
			var thisLoader:any = this;
			//这里要预处理磁盘文件的读取,带layanative目录标识的视为本地磁盘文件，不进行路径转换操作
			if (QGMiniAdapter.isZiYu)
			{
				MiniImage.onCreateImage(url, thisLoader, true);//直接读取本地文件，非加载缓存的图片
				return;
			}
			
			var isTransformUrl:boolean;
			//非本地文件处理
			if (!MiniFileMgr.isLocalNativeFile(url)) {
				isTransformUrl = true;
				url = URL.formatURL(url);
			}else
			{
				if (url.indexOf("http://usr/") == -1&&(url.indexOf("http://") != -1 || url.indexOf("https://") != -1))
				{
					if(MiniFileMgr.loadPath != "")
					{
						url = url.split(MiniFileMgr.loadPath)[1];//去掉http头
					}else
					{
						var tempStr:string = URL.rootPath != "" ? URL.rootPath : URL.basePath;
						var tempUrl:string = url;
						if(tempStr != "")
							url = url.split(tempStr)[1];//去掉http头
						if(!url)
						{
							url = tempUrl;
						}
					}
					
				}
				if (QGMiniAdapter.subNativeFiles && QGMiniAdapter.subNativeheads.length == 0)
				{
					for (var key  in QGMiniAdapter.subNativeFiles)
					{
						var tempArr:any[] = QGMiniAdapter.subNativeFiles[key];
						QGMiniAdapter.subNativeheads = QGMiniAdapter.subNativeheads.concat(tempArr);
						for (var aa:number = 0; aa < tempArr.length;aa++)
						{
							QGMiniAdapter.subMaps[tempArr[aa]] = key + "/" + tempArr[aa];
						}
					}
				}
				//判断当前的url是否为分包映射路径
				if(QGMiniAdapter.subNativeFiles && url.indexOf("/") != -1)
				{
					var curfileHead:string = url.split("/")[0] + "/";//文件头
					if(curfileHead && QGMiniAdapter.subNativeheads.indexOf(curfileHead) != -1)
					{
						var newfileHead:string = QGMiniAdapter.subMaps[curfileHead];
						url = url.replace(curfileHead,newfileHead);
					}
				}
			}
			if (!MiniFileMgr.getFileInfo(url)) 
			{
				if (url.indexOf('http://usr/') == -1&&(url.indexOf("http://") != -1 || url.indexOf("https://") != -1))
				{
					//小游戏在子域里不能远端加载图片资源
					if(QGMiniAdapter.isZiYu)
					{
						MiniImage.onCreateImage(url, thisLoader, true);//直接读取本地文件，非加载缓存的图片
					}else
					{
						//oppo url bug
						MiniFileMgr.downOtherFiles(encodeURI(url), new Handler(MiniImage, MiniImage.onDownImgCallBack, [url, thisLoader]), url);
					}
				}
				else
					MiniImage.onCreateImage(url, thisLoader, true);//直接读取本地文件，非加载缓存的图片
			} else {
				MiniImage.onCreateImage(url, thisLoader, !isTransformUrl);//外网图片加载
			}
		}
		
		/**
		 * @private 
		 * 下载图片文件回调处理
		 * @param sourceUrl 图片实际加载地址
		 * @param thisLoader 加载对象
		 * @param errorCode 回调状态码，0成功 1失败
		 * @param tempFilePath 加载返回的临时地址 
		 */
		private static onDownImgCallBack(sourceUrl:string, thisLoader:any, errorCode:number,tempFilePath:string= ""):void {
			if (!errorCode)
				MiniImage.onCreateImage(sourceUrl, thisLoader,false,tempFilePath);
			else {
				thisLoader.onError(null);
			}
		}
		
		/**
		 * @private 
		 * 创建图片对象
		 * @param sourceUrl
		 * @param thisLoader
		 * @param isLocal 本地图片(没有经过存储的,实际存在的图片，需要开发者自己管理更新)
		 * @param tempFilePath 加载的临时地址
		 */
		private static onCreateImage(sourceUrl:string, thisLoader:any, isLocal:boolean = false,tempFilePath:string= ""):void {
			
			var fileNativeUrl:string;
			if(QGMiniAdapter.autoCacheFile)
			{
				if (!isLocal) {
					if(tempFilePath != "")
					{
						fileNativeUrl = tempFilePath;
					}else
					{
						var fileObj:any = MiniFileMgr.getFileInfo(sourceUrl);
						var fileMd5Name:string = fileObj.md5;
						fileNativeUrl = MiniFileMgr.getFileNativePath(fileMd5Name);
					}
				} else
					if(QGMiniAdapter.isZiYu)
					{
						//子域里需要读取主域透传过来的信息，然后这里获取一个本地磁盘图片路径，然后赋值给fileNativeUrl
						var tempUrl:string = URL.formatURL(sourceUrl);
						if(MiniFileMgr.ziyuFileTextureData[tempUrl])
						{
							fileNativeUrl = MiniFileMgr.ziyuFileTextureData[tempUrl];
						}else
							fileNativeUrl = sourceUrl;
					}else
						fileNativeUrl = sourceUrl;
			}else
			{
				if(!isLocal)
					fileNativeUrl = tempFilePath;
				else
					fileNativeUrl = sourceUrl;
			}
			if (thisLoader._imgCache == null)
				thisLoader._imgCache = {};
				
			//sourceUrl = URL.formatURL(url);
			var image:any;
			function clear():void {
				var img:any = thisLoader._imgCache[sourceUrl];
				if (img) {
					img.onload = null;
					img.onerror = null;
					delete thisLoader._imgCache[sourceUrl];
				}
			}
			
			var onerror:Function = function():void {
				clear();
				delete MiniFileMgr.fakeObj[sourceUrl];
				delete MiniFileMgr.filesListObj[sourceUrl];
				thisLoader.event(Event.ERROR, "Load image failed");
			}
			if (thisLoader._type == "nativeimage") {
				var onload:Function = function():void {
					clear();
					//xiaosong20190301
					//thisLoader._url = URL.formatURL(thisLoader._url);
					thisLoader.onLoaded(image);
				};
				image = new Browser.window.Image();
				image.crossOrigin = "";
				image.onload = onload;
				image.onerror = onerror;
				image.src = fileNativeUrl;
				//增加引用，防止垃圾回收
				thisLoader._imgCache[sourceUrl] = image;
			} else {
				var imageSource:any = new Browser.window.Image();
				onload = function():void {
					//xiaosong20190301
					//thisLoader._url = URL.formatURL(thisLoader._url);
					image = HTMLImage.create(imageSource.width, imageSource.height);
					image.loadImageSource(imageSource, true);
					image._setCreateURL(sourceUrl);
//					image._setUrl(fileNativeUrl);
					clear();
					thisLoader.onLoaded(image);
				};
				imageSource.crossOrigin = "";
				imageSource.onload = onload;
				imageSource.onerror = onerror;
				imageSource.src = fileNativeUrl;
				thisLoader._imgCache[sourceUrl] = imageSource;//增加引用，防止垃圾回收
			}
		}
	}



