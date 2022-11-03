// The logger implementation. 
import { parseArgument } from './cli.js';
export const LOGLEVELS = ['verbose', 'info', 'warning', 'error'];
export const log = function() {
    const minLogLevel = parseArgument('l', 'loglevel', 'info', l => LOGLEVELS.includes(l) ? undefined: 'Must be a valid log level');
    const minLogLevelIndex = LOGLEVELS.indexOf(minLogLevel);
    function _log(level, msg, error) {
        const levelIndex = LOGLEVELS.indexOf(level);
        if (levelIndex < minLogLevelIndex) {
            return;
        }
        console.log(`${new Date().toISOString()} [${level.toUpperCase()}] ${msg}`);
        if (error) {
            console.log(`${new Date().toISOString()} [${level.toUpperCase()}] ${error}`);
        }
    }
    function v(msg, error) {
        _log('verbose', msg, error);
    }
    function i(msg, error) {
        _log('info', msg, error);
    }
    function w(msg, error) {
        _log('warning', msg, error);
    }
    function e(msg, error) {
        _log('error', msg, error);
    }
    function f(msg, error) {
        _log('error', msg, error);
        process.exit(1);
    }
    return {
        v, i, w, e, f, minLogLevel
    }
}();