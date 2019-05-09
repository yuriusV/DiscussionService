module Logic
    open Models
    open DataAccess

    module EntityModel = 
        

    module Admin = 1
    module Auth = 1

    module Users =
        let getUsers id = DataAccess.getUsersById id
    module Communities = 
        module Users = 
        module Posts = 
            module Polls = 
                1