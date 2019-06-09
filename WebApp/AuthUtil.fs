module AuthUtil
open Microsoft.AspNetCore.Http
open Microsoft.AspNetCore.Authentication
open Microsoft.AspNetCore.Authentication.Cookies
open DataAccess
open System.Linq
open System.Security.Claims
open System.Security.Cryptography
open System
//https://github.com/giraffe-fsharp/Giraffe/blob/master/samples/SampleApp/SampleApp/Program.fs

// Prepare
let authScheme = CookieAuthenticationDefaults.AuthenticationScheme
let issuer = "localhost"
let getPasswordHash = id

// Go
let generateSessionToken() = System.Convert.ToBase64String(System.Guid.NewGuid().ToByteArray())


module Cookies = 
    type CookieData = {
        fullName: string;
        name: string;
        imageUrl: string;
        token: string
    }
    let putToken (context: HttpContext) (cookie: CookieData) = 
        context.Response.Cookies.Append("Asp.Net", cookie.token)
        context.Response.Cookies.Append("fullName", cookie.fullName)
        context.Response.Cookies.Append("name", cookie.name)
        context.Response.Cookies.Append("imageUrl", cookie.imageUrl)

    let getToken (context: HttpContext) =
        let mutable value: string = ""
        context.Request.Cookies.TryGetValue("Asp.Net", &value) |> ignore
        value

    let removeToken (context: HttpContext) = 
        context.Response.Cookies.Delete("Asp.Net")
        context.Response.Cookies.Delete("fullName")
        context.Response.Cookies.Delete("name")
        context.Response.Cookies.Delete("imageUrl")

let getCurrentUserId (context: HttpContext) = 
    let userToken = Cookies.getToken context
    if not (isNull userToken) then
        let dbRes = AuthQueries.getLoginData userToken
        if ((getSingleRowValue<int32> dbRes "Exists") = 1) 
        then int32(getSingleRowValue<int64> dbRes "Id")
        else 0
    else 0




let register (context: HttpContext) fullName login password =
    let time = System.DateTime.Now
    let token = generateSessionToken()
    let isExists = AuthQueries.getAlreadyExistsLogin login
    if (getSingleRowValue<int32> isExists "Count") <> int32(0) then false
    else
        let loginData = AuthQueries.register fullName login (getPasswordHash password) token time
        Cookies.putToken context {fullName = fullName; name = login; imageUrl = ""; token=token}
        true


let loginWithCredentials (context: HttpContext) login password =
    let passHash = getPasswordHash password
    let data = AuthQueries.checkCredentials login passHash
    if ((getSingleRowValue<int32> data "Exists")) = int32(1) then
        let userId = getSingleRowValue<int64> data "Id"
        let token = generateSessionToken()
        AuthQueries.setTokenToUser userId token |> ignore

        Cookies.putToken context {
            fullName = (getSingleRowValue<string> data "FullName");
            name = login;
            imageUrl = "";
            token = token
        }

        true
    else false


let logout (context: HttpContext) =
    let userId = getCurrentUserId context
    if userId <> 0 then
        AuthQueries.logout (Cookies.getToken context) |> ignore
        Cookies.removeToken context
        true
    else false