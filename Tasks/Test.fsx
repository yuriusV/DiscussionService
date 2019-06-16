 #r "Newtonsoft.Json.dll";;

type T = {
    a: System.DBNull
};;



 let a = Newtonsoft.Json.JsonConvert.SerializeObject({a = System.DBNull()});;