module AuthUtil
open Microsoft.AspNetCore.Http

let getCurrentUserId (context: HttpContext) = 
    1