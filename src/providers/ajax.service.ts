import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpHeaders,
  HttpResponse,
  HttpErrorResponse
} from "@angular/common/http";
import { CommonService } from "./common-service/common.service";
import { iNavigation } from "./iNavigation";
import { Observable } from "rxjs/internal/Observable";

const TokenName = "Authorization";
@Injectable()
export class AjaxService {
  baseUrl: string = "";
  constructor(
    private http: HttpClient,
    private commonService: CommonService,
    private nav: iNavigation
  ) {
    //this.baseUrl = "http://localhost:9100/api/";
    this.baseUrl = "http://localhost:9100/";
    //this.baseUrl = "http://www.pengven.com/Business/api/";
  }

  public GetImageBasePath() {
    let ImageBaseUrl = this.baseUrl.replace("api", "UploadedFiles");
    return ImageBaseUrl;
  }

  LoadStaticJson(StaticUrl): Observable<any> {
    let JsonData = this.http.get(StaticUrl);
    this.commonService.HideLoader();
    return JsonData;
  }

  RequestHeader(): any {
    const headers = new HttpHeaders({
      "Content-Type": "application/json; charset=utf-8",
      Accept: "application/json"
    });
    return headers;
  }

  RequestPlainHeader(): any {
    const headers = new HttpHeaders({
      "Content-Type": "application/json; charset=ISO-8859-1",
      Accept: "application/json"
    });
    return headers;
  }

  UploadRequestHeader(): any {
    const headers = new HttpHeaders({
    });
    return headers;
  }

  getWithHeader(Url: string): Observable<any> {
    this.commonService.ShowLoaderByAjax();
    let _header = this.RequestHeader();
    return this.http.get(this.baseUrl + Url).pipe(
      (res: any) => {
        if (res !== null && res !== "") {
          let Data = JSON.parse(res.body);
          this.commonService.HideLoaderByAjax();
          return Data;
        } else {
          this.commonService.HideLoaderByAjax();
          this.commonService.ShowToast(
            "Getting server error. Please constact to admin."
          );
        }
      },
      error => {
        this.commonService.HideLoaderByAjax();
        return error;
      }
    );
  }

  get(Url: string, IsLoaderRequired: boolean = true): Promise<any> {
    return new Promise((resolve, reject) => {
      let _header = null;
      if (typeof IsLoaderRequired !== undefined) {
        if (IsLoaderRequired) {
          this.commonService.ShowLoaderByAjax();
        } else {
          _header = this.RequestPlainHeader();
        }
      } else {
        this.commonService.ShowLoaderByAjax();
      }
      _header = this.RequestHeader();
      this.http
        .get(this.baseUrl + Url, {
          headers: _header,
          observe: "response"
        })
        .subscribe(
          (res: any) => {
            if (res.body !== null && res.body !== "") {
              let Data = JSON.parse(res.body);
              this.commonService.HideLoaderByAjax();
              resolve(Data);
            } else {
              this.commonService.HideLoaderByAjax();
              //this.commonService.ShowToast("Server return empty result");
              resolve([]);
            }
          },
          (error: HttpErrorResponse) => {
            this.commonService.HideLoaderByAjax();
            if (error.status === 401) {
              reject(false);
              this.commonService.ShowToast(
                "Your session expired. Please login again."
              );
              this.nav.navigate("/", "");
            } else if (error.status === 404) {
              this.commonService.ShowToast(
                "Unable to get data. Your session is expired."
              );
              reject(error);
              this.nav.navigate("/", null);
            } else {
              this.commonService.ShowToast(
                "Unable to get data. Your session is expired."
              );
              reject(error);
              this.nav.navigate("/", null);
            }
          }
        );
    });
  }

  post(Url: string, Param: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.commonService.ShowLoaderByAjax();
      let _header = this.RequestHeader();
      if (this.commonService.IsValid(Param)) {
        this.http
          .post(this.baseUrl + Url, Param, {
            headers: _header,
            observe: "response"
          })
          .subscribe(
            (res: HttpResponse<any>) => {
              let Data = "";
              try {
                if (res.body !== null && res.body !== "") {
                  this.commonService.HideLoaderByAjax();
                  Data = JSON.parse(res.body);
                } else {
                  this.commonService.HideLoaderByAjax();
                  this.commonService.ShowToast(
                    "Server error. Please contact admin."
                  );
                }
              } catch (e) {
                console.log("Normal data");
                Data = res.body;
              }
              resolve(Data);
              this.commonService.HideLoaderByAjax();
            },
            error => {
              this.commonService.HideLoaderByAjax();
              if (error.status === 401) {
                reject(false);
                this.commonService.ShowToast(
                  "Your session expired. Please login again."
                );
                this.nav.navigate("/", "");
              } else {
                reject(error);
              }
            }
          );
      }
    });
  }

  upload(Url: string, Param: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.commonService.ShowLoaderByAjax();
      let _header = this.UploadRequestHeader();
      this.http
        .post(this.baseUrl + Url, Param, {
          headers: _header,
          observe: "response"
        })
        .subscribe(
          (res: HttpResponse<any>) => {
            let Token = res.headers.get(TokenName);
            if (this.commonService.IsValid(Token)) {
              this.setCookies(Token);
              let Data = "";
              try {
                if (res.body !== null && res.body !== "") {
                  this.commonService.HideLoaderByAjax();
                  Data = JSON.parse(res.body);
                } else {
                  this.commonService.HideLoaderByAjax();
                  this.commonService.ShowToast(
                    "Server error. Please contact admin."
                  );
                }
              } catch (e) {
                console.log("Normal data");
                Data = res.body;
              }
              resolve(Data);
            } else {
              reject(false);
              this.nav.navigate("/", "");
              this.commonService.ShowToast(
                "Unauthorized access is denied. Please login again."
              );
            }
            this.commonService.HideLoaderByAjax();
          },
          error => {
            this.commonService.HideLoaderByAjax();
            if (error.status === 401) {
              reject(false);
              this.commonService.ShowToast(
                "Your session expired. Please login again."
              );
              this.nav.navigate("/", "");
            } else {
              reject(error);
            }
          }
        );
    });
  }

  getToken() {
    let cookie = document.cookie;
    let Token = "";
    if (cookie != null && cookie != "") {
      let cookieData = cookie.split(";");
      if (cookieData != null && cookieData.length > 0) {
        let TokenKey = null;
        let index = 0;
        while (index < cookieData.length) {
          if (cookieData[index].indexOf(TokenName) != -1) {
            TokenKey = cookieData[index];
            if (TokenKey.split("=").length > 0) {
              Token = TokenKey.split("=")[1];
              break;
            }
          }
          index++;
        }
      }
    }
    return Token;
  }

  setCookies(token: string) {
    if (token !== null && token !== "") {
      var now = new Date();
      var expirymin = 0.5 * 60 * 1000;
      now.setTime(now.getTime() + expirymin);
      document.cookie = TokenName + "=" + token + ";";
      document.cookie = "expires=" + now.toUTCString() + ";";
    }
  }
}
