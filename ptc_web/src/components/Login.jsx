import React from "react";
function Login() {
    return (
        <>
        <br />
            <div className="container" >
                <form id="form_login">
                    <div className="parteSuperior">
                        <h1>LOGIN</h1>
                        <label htmlFor="txtusu"><strong>Username</strong></label>
                        <input type="text" id="txtusu"  className="form-control" required />
                    </div>
                    <div>
                        <label htmlFor="txtpas"><strong>Password</strong></label>
                        <input type="password" id="txtpas"  className="form-control" required />
                    </div><br />
                    <input type="submit" className="btn btn-primary" value="Login" />
                </form>
            </div>
        </>

    );
}
export default Login;
