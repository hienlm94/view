var express = require('express');
var webdriverio = require('webdriverio');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

router.post('/get-data', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var st = req.body.st;
    var en = req.body.en;
    var link_home = req.body.link_home;
    var sub_link = req.body.sub_link;

    var options = {
        desiredCapabilities: {
            browserName: 'chrome',
            chromeOptions: {
                'binary': "/usr/bin/chromium-browser",
                "args": ['headless', '--disable-dev-shm-usage' ,'--disable-gpu']
            }
        }
    };


    var client = webdriverio.remote(options);
    client.init().then(function () {
        client.url(link_home).then(function () {
            client.pause(100).then(function () {
                client.setValue('#txtUserName', username).then(function () {
                    client.setValue('#txtPassWord', password).then(function () {
                        client.click("#btnLogin").then(function () {
                            client.url(sub_link).then(function () {
                                client.execute(function (start_date, end_date) {
                                    var start = document.getElementById("from-date");
                                    start.value = start_date;
                                    var start = document.getElementById("to-date");
                                    start.value = end_date;
                                    document.getElementsByClassName('btn-submit')[0].click();
                                }, st, en).then(function () {
                                    client.execute(function () {
                                        var table = document.getElementById("tbl-report");
                                        var num_rows = table.rows.length;
                                        var data = [];
                                        if (num_rows > 4) {
                                            for (var i = 4; i < num_rows; i++) {
                                                var ob = {};
                                                var objCells = table.rows.item(i).cells;
                                                ob["Usename"] = objCells.item(0).textContent.replace(/\s/g, '');
                                                ob["Bet_Count"] = objCells.item(1).innerHTML.replace(/\s/g, '')
                                                ob["Turnover"] = objCells.item(2).innerHTML.replace(/\s/g, '')
                                                ob["Net_Turnover"] = objCells.item(3).innerHTML.replace(/\s/g, '')
                                                ob["Gross_Comm"] = objCells.item(4).innerHTML.replace(/\s/g, '')
                                                var Member = {};
                                                Member["Win_loss"] = objCells.item(5).innerHTML.replace(/\s/g, '')
                                                Member["Comm"] = objCells.item(6).innerHTML.replace(/\s/g, '')
                                                Member["Toltal"] = objCells.item(7).innerHTML.replace(/\s/g, '')
                                                ob["Member"] = Member;
                                                var Agent = {};
                                                Agent["Win_loss"] = objCells.item(8).innerHTML.replace(/\s/g, '')
                                                Agent["Comm"] = objCells.item(9).innerHTML.replace(/\s/g, '')
                                                Agent["Toltal"] = objCells.item(10).innerHTML.replace(/\s/g, '')
                                                ob["Agent"] = Agent;
                                                var Master = {};
                                                Master["Win_loss"] = objCells.item(11).innerHTML.replace(/\s/g, '')
                                                Master["Comm"] = objCells.item(12).innerHTML.replace(/\s/g, '')
                                                Master["Toltal"] = objCells.item(13).innerHTML.replace(/\s/g, '')
                                                ob["Master"] = Master;

                                                ob["Company"] = objCells.item(14).innerHTML.replace(/\s/g, '')
                                                data.push(ob);
                                            }
                                            var elem = document.createElement('div');
                                            elem.setAttribute("id","datajson")
                                            elem.innerText = JSON.stringify(data);
                                            document.body.appendChild(elem);
                                        }
                                    }).then(function () {
                                        client.getText("#datajson").then(function (text) {
                                            var datas = JSON.parse(text);
                                            res.send({"status": "success", "data"  : datas});
                                            client.end();
                                        })
                                    })

                                })
                            })
                        })
                    })
                })

            })
        })
    })


})

module.exports = router;