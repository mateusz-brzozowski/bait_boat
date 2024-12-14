'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
var core$1 = require('@angular/core');
var core = require('@ionic-native/core');

var Hotspot = /** @class */ (function (_super) {
    tslib.__extends(Hotspot, _super);
    function Hotspot() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Hotspot.prototype.isAvailable = function () { return core.cordova(this, "isAvailable", {}, arguments); };
    Hotspot.prototype.toggleWifi = function () { return core.cordova(this, "toggleWifi", {}, arguments); };
    Hotspot.prototype.createHotspot = function (ssid, mode, password) { return core.cordova(this, "createHotspot", {}, arguments); };
    Hotspot.prototype.startHotspot = function () { return core.cordova(this, "startHotspot", {}, arguments); };
    Hotspot.prototype.configureHotspot = function (ssid, mode, password) { return core.cordova(this, "configureHotspot", {}, arguments); };
    Hotspot.prototype.stopHotspot = function () { return core.cordova(this, "stopHotspot", {}, arguments); };
    Hotspot.prototype.isHotspotEnabled = function () { return core.cordova(this, "isHotspotEnabled", {}, arguments); };
    Hotspot.prototype.getAllHotspotDevices = function () { return core.cordova(this, "getAllHotspotDevices", {}, arguments); };
    Hotspot.prototype.connectToWifi = function (ssid, password) { return core.cordova(this, "connectToWifi", {}, arguments); };
    Hotspot.prototype.connectToWifiAuthEncrypt = function (ssid, password, authentication, encryption) { return core.cordova(this, "connectToWifiAuthEncrypt", {}, arguments); };
    Hotspot.prototype.addWifiNetwork = function (ssid, mode, password) { return core.cordova(this, "addWifiNetwork", {}, arguments); };
    Hotspot.prototype.removeWifiNetwork = function (ssid) { return core.cordova(this, "removeWifiNetwork", {}, arguments); };
    Hotspot.prototype.isConnectedToInternet = function () { return core.cordova(this, "isConnectedToInternet", {}, arguments); };
    Hotspot.prototype.isConnectedToInternetViaWifi = function () { return core.cordova(this, "isConnectedToInternetViaWifi", {}, arguments); };
    Hotspot.prototype.isWifiOn = function () { return core.cordova(this, "isWifiOn", {}, arguments); };
    Hotspot.prototype.isWifiSupported = function () { return core.cordova(this, "isWifiSupported", {}, arguments); };
    Hotspot.prototype.isWifiDirectSupported = function () { return core.cordova(this, "isWifiDirectSupported", {}, arguments); };
    Hotspot.prototype.scanWifi = function () { return core.cordova(this, "scanWifi", {}, arguments); };
    Hotspot.prototype.scanWifiByLevel = function () { return core.cordova(this, "scanWifiByLevel", {}, arguments); };
    Hotspot.prototype.startWifiPeriodicallyScan = function (interval, duration) { return core.cordova(this, "startWifiPeriodicallyScan", {}, arguments); };
    Hotspot.prototype.stopWifiPeriodicallyScan = function () { return core.cordova(this, "stopWifiPeriodicallyScan", {}, arguments); };
    Hotspot.prototype.getNetConfig = function () { return core.cordova(this, "getNetConfig", {}, arguments); };
    Hotspot.prototype.getConnectionInfo = function () { return core.cordova(this, "getConnectionInfo", {}, arguments); };
    Hotspot.prototype.pingHost = function (ip) { return core.cordova(this, "pingHost", {}, arguments); };
    Hotspot.prototype.getMacAddressOfHost = function (ip) { return core.cordova(this, "getMacAddressOfHost", {}, arguments); };
    Hotspot.prototype.isDnsLive = function (ip) { return core.cordova(this, "isDnsLive", {}, arguments); };
    Hotspot.prototype.isPortLive = function (ip) { return core.cordova(this, "isPortLive", {}, arguments); };
    Hotspot.prototype.isRooted = function () { return core.cordova(this, "isRooted", {}, arguments); };
    Hotspot.pluginName = "Hotspot";
    Hotspot.plugin = "cordova-plugin-hotspot";
    Hotspot.pluginRef = "cordova.plugins.hotspot";
    Hotspot.repo = "https://github.com/hypery2k/cordova-hotspot-plugin";
    Hotspot.platforms = ["Android"];
    Hotspot.decorators = [
        { type: core$1.Injectable }
    ];
    return Hotspot;
}(core.IonicNativePlugin));

exports.Hotspot = Hotspot;
