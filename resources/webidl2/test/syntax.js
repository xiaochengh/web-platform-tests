
var wp = process.env.JSCOV ? require("../lib-cov/webidl2") : require("../lib/webidl2")
,   expect = require("expect")
,   pth = require("path")
,   fs = require("fs")
,   jdp = require("jsondiffpatch")
,   debug = true
;
describe("Parses all of the IDLs to produce the correct ASTs", function () {
    var dir = pth.join(__dirname, "syntax/idl")
    ,   skip = {} // use if we have a broken test
    ,   idls = fs.readdirSync(dir)
                  .filter(function (it) { return (/\.widl$/).test(it) && !skip[it]; })
                  .map(function (it) { return pth.join(dir, it); })
    ,   jsons = idls.map(function (it) { return pth.join(__dirname, "syntax/json", pth.basename(it).replace(".widl", ".json")); })
    ;

    for (var i = 0, n = idls.length; i < n; i++) {
        var idl = idls[i], json = jsons[i];

        var func = (function (idl, json) {
            return function () {
                try {
                    var optFile = pth.join(__dirname, "syntax/opt", pth.basename(json));
                    var opt = undefined;
                    if (fs.existsSync(optFile))
                        opt = JSON.parse(fs.readFileSync(optFile, "utf8"));
                    var diff = jdp.diff(JSON.parse(fs.readFileSync(json, "utf8")),
                                        wp.parse(fs.readFileSync(idl, "utf8"), opt));
                    if (diff && debug) console.log(JSON.stringify(diff, null, 4));
                    expect(diff).toBe(undefined);
                }
                catch (e) {
                    console.log(e.toString());
                    throw e;
                }
            };
        }(idl, json));
        it("should produce the same AST for " + idl, func);
    }
});
