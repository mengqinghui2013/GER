(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

/**
 * @author suman
 * @fileoverview report
 * @date 2017/02/15
 */

var utils = {
    typeDecide: function typeDecide(o, type) {
        return Object.prototype.toString.call(o) === "[object " + type + "]";
    },
    serializeObj: function serializeObj(obj) {
        var parames = '';
        Object.keys(obj).forEach(function (name) {
            parames += name + '=' + obj[name] + '&';
        });
        return parames;
    }
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

/**
 * @author  zdongh2016
 * @fileoverview
 * @date 2017/02/16
 */
var Events = function () {
    function Events() {
        classCallCheck(this, Events);

        this.handlers = {};
    }

    createClass(Events, [{
        key: "on",
        value: function on(event, handler) {
            if (typeof event === "string" && typeof handler === "function") {
                this.handlers[event] = typeof this.handlers[event] === "undefined" ? [] : this.handlers[event];
                this.handlers[event].push(handler);
            }
        }
    }, {
        key: "off",
        value: function off(event) {
            this.handlers[event] !== undefined && delete this.handlers[event];
        }
    }, {
        key: "trigger",
        value: function trigger(event) {
            if (this.handlers[event] instanceof Array) {
                this.handlers[event].forEach(function (v, i) {
                    this.handlers[event][i]();
                }.bind(this));
            }
            return this.handlers[event] !== undefined;
        }
    }]);
    return Events;
}();

/**
 * @author  zdongh2016
 * @fileoverview config
 * @date 2017/02/16
 */
var Config = function (_Events) {
    inherits(Config, _Events);

    function Config(options) {
        classCallCheck(this, Config);

        var _this = possibleConstructorReturn(this, (Config.__proto__ || Object.getPrototypeOf(Config)).call(this));

        _this.config = {
            mergeReport: true, // mergeReport 是否合并上报， false 关闭， true 启动（默认）
            delay: 1000, // 当 mergeReport 为 true 可用，延迟多少毫秒，合并缓冲区中的上报（默认）
            url: "ewewe", // 指定错误上报地址
            except: [/Script error/i], // 忽略某个错误
            random: 1, // 抽样上报，1~0 之间数值，1为100%上报（默认 1）
            repeat: 5, // 重复上报次数(对于同一个错误超过多少次不上报)
            //errorLSSign:'mx-error'                  // error错误数自增 0
            //maxErrorCookieNo:50,                    // error错误数自增 最大的错
            tryPeep: false,
            peepSystem: false,
            peepJquery: false,
            peepConsole: true
        };
        Object.assign(_this.config, options); /// this.config
        return _this;
    }

    createClass(Config, [{
        key: "get",
        value: function get$$1(name) {
            return this.config[name];
        }
    }, {
        key: "set",
        value: function set$$1(name, value) {
            this.config[name] = value;
        }
    }]);
    return Config;
}(Events);

/**
 * @author suman
 * @fileoverview report
 * @date 2017/02/15
 */

var Report = function (_Config) {
    inherits(Report, _Config);

    function Report(options) {
        classCallCheck(this, Report);

        var _this = possibleConstructorReturn(this, (Report.__proto__ || Object.getPrototypeOf(Report)).call(this, options));

        _this.errorQueue = [];
        _this.repeatList = {};
        _this.mergeTimeout = null;
        _this.url = _this.config.url;
        _this.srcs = [];

        ['log', 'debug', 'info', 'warn', 'error'].forEach(function (type, index) {
            var _this2 = this;

            this[type] = function (msg) {
                _this2.handleMsg(msg, type, index);
            };
        }.bind(_this));

        return _this;
    }

    createClass(Report, [{
        key: "repeat",
        value: function repeat(error) {
            var repeatName = error.rowNum === undefined || error.colNum === undefined ? error.msg : error.msg + error.rowNum + error.colNum;
            this.repeatList[repeatName] = this.repeatList[repeatName] === undefined ? 1 : this.repeatList[repeatName] + 1;
            //this.repeatList[repeatName] = this.repeatList[repeatName] > this.config.repeat ? this.config.repeat : this.repeatList[repeatName];
            return this.repeatList[repeatName] <= this.config.repeat;
        }
    }, {
        key: "report",
        value: function report(cb) {
            var parames = '';
            var queue = this.errorQueue;

            if (this.config.mergeReport) {
                // 合并上报
                console.log('合并上报');
                parames = queue.map(function (obj) {
                    return utils.serializeObj(obj);
                }).join('|');
            } else {
                // 不合并上报
                console.log('不合并上报');
                if (queue.length) {
                    var _obj = queue[0];
                    parames = utils.serializeObj(_obj);
                }
            }
            this.url += '?' + parames;
            var oImg = new Image();
            oImg.onload = function () {
                queue = [];
                if (cb) {
                    cb.call(this);
                }
                this.trigger('afterReport');
            }.bind(this);
            oImg.src = this.url;
            this.srcs.push(oImg.src);
            console.log(this.srcs);
        }
        // 发送

    }, {
        key: "send",
        value: function send(isNowReport, cb) {
            this.trigger('beforeReport');

            if (isNowReport) {
                // 延迟上报
                this.mergeTimeout = setTimeout(function () {
                    this.report(cb);
                }.bind(this), this.config.delay);
            } else {
                // 现在上报
                this.report(cb);
            }
        }
        // push错误到pool

    }, {
        key: "carryError",
        value: function carryError(error) {
            if (!error) {
                console.warn('carryError方法内 error 参数为空');
                return;
            }
            // 拿到onerror的参数 先判断重复 抽样 再放数组中

            var rnd = Math.random();
            if (rnd >= this.config.random) {
                console.warn('抽样' + rnd + '|||' + this.config.random);
                return error;
            }
            console.warn('不抽样');
            //console.log(this.repeat(error))
            this.repeat(error) && this.errorQueue.push(error);
        }

        // 手动上报 处理方法:全部立即上报 需要延迟吗?

    }, {
        key: "handleMsg",
        value: function handleMsg(msg, type, level) {
            if (!msg) {
                console.warn(type + '方法内 msg 参数为空');
                return;
            }
            var errorMsg = utils.typeDecide(msg, 'String') ? { msg: msg } : msg;
            errorMsg.level = level;
            this.carryError(errorMsg);
            this.send();
            return errorMsg;
        }
    }]);
    return Report;
}(Config);

var obj = {
    'a': "1",
    'b': "2"
};
var str = '{';
str += Object.keys(obj).map(function (k) {
    var ksep = '"';
    var vsep = typeof obj[k] === 'number' ? '' : ksep;
    return ksep + k + ksep + ':' + vsep + obj[k] + vsep;
}).join(',') + '}';
console.log(str);

/**
 * @author  zdongh2016
 * @fileoverview GER
 * @date 2017/02/15
 */
var GER = function (_Report) {
    inherits(GER, _Report);

    function GER(options) {
        classCallCheck(this, GER);

        var _this = possibleConstructorReturn(this, (GER.__proto__ || Object.getPrototypeOf(GER)).call(this, options));

        _this.rewriteError();
        return _this;
    }

    createClass(GER, [{
        key: 'rewriteError',
        value: function rewriteError() {
            var _this2 = this;

            window.onerror = function (msg, url, line, col, error) {
                if (_this2.trigger('error')) {
                    return false;
                }
                var reportMsg = msg;
                if (error.stack && error) {
                    reportMsg = _this2.handleErrorStack(error);
                }
                if (utils.typeDecide(reportMsg, "Event")) {
                    reportMsg += reportMsg.type ? "--" + reportMsg.type + "--" + (reportMsg.target ? reportMsg.target.tagName + "::" + reportMsg.target.src : "") : "";
                }
                _this2.carryError({
                    msg: reportMsg,
                    rolNum: line,
                    colNum: col,
                    targetUrl: url
                });
                _this2.send();
                return true;
            };
        }
        // 处理onerror返回的error.stack

    }, {
        key: 'handleErrorStack',
        value: function handleErrorStack(error) {
            var stackMsg = error.stack;
            var errorMsg = error.toString();
            if (stackMsg.indexOf(errorMsg) === -1) {
                stackMsg += '@';
                stackMsg += errorMsg;
            }
            return stackMsg;
        }
    }]);
    return GER;
}(Report);

window.Ger = GER;

})));
