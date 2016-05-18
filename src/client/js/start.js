import React from 'react';
import ReactDom from 'react-dom';

function getUUID(strQuery) {
    var strSearch = strQuery.substr(1),
        strPattern = /([^=]+)=([^&]+)&?/ig,
        arrMatch = strPattern.exec(strSearch),
        objRes = {};
    while (arrMatch != null) {
        objRes[arrMatch[1]] = arrMatch[2];
        arrMatch = strPattern.exec(strSearch);
    }
    return objRes['uuid'];
};

function getLoginUrl() {
    var host = window.location.host;
    host = host.replace('chess.', 'login.');
    return "//" + host;
    //return "https://login.wrioos.com";
};

class Start extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            profile: !1,
            disabled: true,
            twitter: {
                buttonurl: getLoginUrl() + "/buttons/twitter"
            }
        }
    }

    componentWillMount() {
        $.ajax({
                type: "GET",
                url: "/data",
                data: {
                    uuid: getUUID(window.location.search)
                }
            })
            .success((res) => {
                this.setState({
                    user: res.user,
                    invite: res.invite,
                    alien: res.alien,
                    expired: res.expired
                });
            })
            .fail((err) => {
                this.setState({
                    expired: !0
                });
            });
    }

    start() {
        if (this.state.invite && this.state.invite !== "") {
            $.ajax({
                type: "POST",
                url: "/api/invite_callback",
                data: {
                    user: this.state.user.titterID,
                    uuid: getUUID(window.location.search),
                    invite: this.state.invite
                }
            }).success(() => {
                this.state.footer = "Game started, you can return to Twitter";
                window.close();
            }).fail(() => {
                this.state.footer = "Link Expired";
            });
        } else {
            $.ajax({
                type: "POST",
                url: "/api/access_callback",
                data: {
                    uuid: getUUID(window.location.search),
                    user: this.state.user.titterID
                }
            }).success(() => {
                this.state.footer = "Game started, you can return to Twitter";
                window.close();
            });
        }
    }

    componentDidMount() {
        window.addEventListener('message', (e) => {
            var message = e.data;
            var httpChecker = new RegExp('^(http|https)://login.wrioos.com', 'i');
            if (httpChecker.test(e.origin)) {
                var jsmsg = JSON.parse(message);

                if (jsmsg.login == "success") {
                    location.reload();
                }

                if (jsmsg.profile) {
                    jsmsg = jsmsg.profile;
                    if (jsmsg.temporary) {
                        this.setState({
                            disabled: false
                        });
                    } else {
                        this.setState({
                            profile: jsmsg
                        });
                    }
                }
            }
        });
    }
    
    logoff() {
        $.ajax('/logoff').success(() => {
            location.reload();
        });
    }

    render() {
        var button = this.state.invite ? "Accept" : "Start";
        var _button = this.state.invite ? "Login & Accept" : "Login & Start";
        this.state.footer = this.state.alien ? "This link is for the player @" + this.state.user.username : (this.state.expired ? "Link Expired" : "...please wait");

        var style = {
            marginTop: '10px'
        };

        this.state.form = this.state.profile ?
            <div>
                <h4> {this.state.profile.name} </h4>
                <button type="button" className="btn btn-default" onClick={this.logoff}> Log out </button>
                <button type="button" className="btn btn-primary ok" disabled = {this.state.disabled}><span className="glyphicon glyphicon-ok"></span>{button}</button >
                <h4>{this.state.footer}</h4>
            </div> :
            <div>
                <button type="button" className="btn btn-primary ok" style={style} onClick={Start.openAuthPopup} disabled={this.state.disabled}><span className = "glyphicon glyphicon-ok"></span>{_button}</button>
                <h4>{this.state.footer}</h4>
            </div>

        return (
            <div>
                {this.state.form}
                <iframe id="loginbuttoniframe" src={ this.state.twitter.buttonurl } width="0" height="0" frameBorder="no" scrolling="no"></iframe>
            </div>
        )
    }

}

ReactDom.render( < Start / > , document.getElementById('startholder'));
