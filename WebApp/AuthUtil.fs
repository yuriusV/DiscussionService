module AuthUtil
open Microsoft.AspNetCore.Http
//https://github.com/giraffe-fsharp/Giraffe/blob/master/samples/SampleApp/SampleApp/Program.fs
let getCurrentUserId (context: HttpContext) = 
    1