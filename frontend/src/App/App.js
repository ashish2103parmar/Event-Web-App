import React from 'react';
import { HashRouter, Switch, Route, Redirect } from 'react-router-dom'
import Main from './Main';
import SignIn from './SignIn';
import SignUp from './SignUp';
import Dasboard from './Dasboard';
/**
 * Handle Routing
 */
function App() {
    return (
        <div className="App">
            <HashRouter>
                <Switch>
                    <Route exact path="/" component={Main} />
                    <Route path="/signin" component={SignIn} />
                    <Route path="/signup" component={SignUp} />
                    <Route path="/dashboard" component={Dasboard} />
                    <Route>
                        <Redirect to="/" />
                    </Route>
                </Switch>
            </HashRouter>
        </div>
    );
}

export default App;
