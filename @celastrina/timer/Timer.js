/*
 * Copyright (c) 2021, KRI, LLC.
 *
 * MIT License
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
/**
 * @author Robert R Murrell
 * @copyright Robert R Murrell
 * @license MIT
 */
"use strict";
const moment = require("moment");
const {CelastrinaError, LOG_LEVEL, Configuration, Context, BaseFunction, CelastrinaEvent, AddOn, ConfigLoader,
	   AddOnEvent} = require("@celastrina/core");
/**
 * TimeContext
 * @author Robert R Murrell
 */
class TimerContext extends Context {
	constructor(config) {
		super(config);
		this._config.context.bindings.tick.scheduleStatus.last = moment(this._config.context.bindings.tick.scheduleStatus.last);
		this._config.context.bindings.tick.scheduleStatus.lastUpdated = moment(this._config.context.bindings.tick.scheduleStatus.lastUpdated);
		this._config.context.bindings.tick.scheduleStatus.next = moment(this._config.context.bindings.tick.scheduleStatus.next);
	}
	/**@returns{boolean}*/get isPastDue() {return this._config.context.bindings.tick.isPastDue;}
	/**@returns{boolean}*/get adjustForDST() {return this._config.context.bindings.tick.schedule.adjustForDST;}
	/**@returns{moment.Moment}*/get lastRun() {return this._config.context.bindings.tick.scheduleStatus.last;}
	/**@returns{moment.Moment}*/get lastUpdated() {return this._config.context.bindings.tick.scheduleStatus.lastUpdated;}
	/**@returns{moment.Moment}*/get nextRun() {return this._config.context.bindings.tick.scheduleStatus.next;}
}
/**
 * TickEvent
 * @author Robert R Murrell
 */
class TickEvent extends CelastrinaEvent {
	/**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/timer/TickEvent#",
		                                              type: "celastrinajs.timer.TickEvent"};}
	/**
	 * @param {Context} context
	 * @param {*} [source=null]
	 * @param {boolean} [rejected=false]
	 * @param {boolean} [aborted=false]
	 * @param {*} [cause=null]
	 * @param {*} [data=null]
	 * @param {moment.Moment} [time=moment()]
	 */
	constructor(context, source = null, rejected = false, aborted = false, cause = null,
	            data = null, time = moment()) {
		super(context, source, data, time, rejected, cause);
		this._aborted = aborted;
	}
	/**@return{boolean}*/get isAborted() {return this._aborted;}
	/**@param{*}cause*/set cause(cause) {this._cause = CelastrinaError.wrapError(cause);}
	reject(cause = null) {
		super.reject(CelastrinaError.wrapError(cause));
	}
	abort(cause = null) {
		this._rejected = true;
		this._aborted = true;
		this.cause = cause;
	}
}
/**
 * @typedef TimerAddOnEvent
 * @extends AddOnEvent
 * @property {TimerFunction} source
 * @property {TimerContext} context
 */
/**
 * TimerFunction
 * @author Robert R Murrell
 * @abstract
 */
class TimerFunction extends BaseFunction {
	/**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/timer/TimerFunction#",
		                                              type: "celastrinajs.timer.TimerFunction"};}
	/**@param{Configuration}configuration*/
	constructor(configuration) {
		super(configuration);
	}
	/**
	 * @param {Configuration} config
	 * @return {Promise<TimerContext>}
	 */
	async createContext(config) {
		return new TimerContext(config);
	}
	/**
	 * @param {TickEvent} event
	 * @returns {Promise<void>}
	 * @abstract
	 */
	async onTick(event) {throw CelastrinaError.newError("Not Implemented.", 501);}
	/**
	 * @param {TickEvent} event
	 * @returns {Promise<void>}
	 */
	async onReject(event) {} // Override to do something
	/**
	 * @param {TickEvent} event
	 * @returns {Promise<void>}
	 */
	async onAbort(event) {} // Override to do something
}
/**
 * @typedef TimerConfig
 * @property {boolean} rejectOnPastDue
 * @property {boolean} abortOnReject
 */
/**
 * TimerConfigParser
 * @author Robert R Murrell
 */
class TimerConfigLoader extends ConfigLoader {
	/**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/timer/TimerConfigParser#",
		                                              type: "celastrinajs.timer.TimerConfigParser"};}
	constructor(link = null, version = "1.0.0") {
		super("Timer", link, version);
	}
	/**
	 * @param {Object} _Configuration
	 * @param {Object} config
	 * @return {Promise<void>}
	 * @private
	 */
	async _load(_Configuration, config) {
		config[TimerAddOn.CONFIG_TIMER] = _Configuration;
	}
}
/**
 * TimerAddOn
 * @author Robert R Murrell
 */
class TimerAddOn extends AddOn {
	/**@return{Object}*/static get $object() {return {schema: "https://celastrinajs/schema/v1.0.0/timer/TimerAddOn#",
		                                              type: "celastrinajs.timer.TimerAddOn",
		                                              addOn: "celastrinajs.timer.addon.timer"};}
	/**@type{string}*/static CONFIG_TIMER = "celastrinajs.addon.timer.config";
	/**
	 * @param {boolean} rejectOnPastDue
	 * @param {boolean} abortOnReject
	 */
	constructor(rejectOnPastDue = false, abortOnReject = false) {
		super();
		/**@type{TimerConfig}*/this._timerconfig = {
			rejectOnPastDue: rejectOnPastDue,
			abortOnReject: abortOnReject
		};
	}
	/**@return{TimerConfigLoader}*/getConfigLoader() {
		return new TimerConfigLoader();
	}
	/**
	 * @param {Object} azcontext
	 * @param {Object} config
	 * @param {AddOnEventHandler} handler
	 * @return {Promise<void>}
	 */
	async install(azcontext, config, handler) {
		/**@type{TimerConfig}*/let timerconfig = config[TimerAddOn.CONFIG_TIMER];
		if(typeof timerconfig !== "undefined" && timerconfig != null) // Override what was programmatically set
			Object.assign(this._timerconfig, timerconfig);
		config[Configuration.CONFIG_AUTHORIATION_OPTIMISTIC] = true; // Need to set to optimistic AuthN/Z
		await handler.addEventListener(AddOnEvent.TYPE.BEFORE_PROCESS, this, TimerAddOn.handleProcessLifecycle);
	}
	/**@return{boolean}*/get rejectOnPastDue() {return this._timerconfig.rejectOnPastDue;}
	/**@param{boolean}rejectOnPastDue*/set rejectOnPastDue(rejectOnPastDue) {this._timerconfig.rejectOnPastDue = rejectOnPastDue;}
	/**@return{boolean}*/get abortOnReject() {return this._timerconfig.abortOnReject;}
	/**@param{boolean}abortOnReject*/set abortOnReject(abortOnReject) {this._timerconfig.abortOnReject = abortOnReject;}
	/**
	 * @param {boolean} rejectOnPastDue
	 * @return {TimerAddOn}
	 */
	setRejectOnPastDue(rejectOnPastDue) {
		this._timerconfig.rejectOnPastDue = rejectOnPastDue;
		return this;
	}
	/**
	 * @param {boolean} abortOnReject
	 * @return {TimerAddOn}
	 */
	setAbortOnReject(abortOnReject) {
		this._timerconfig.abortOnReject = abortOnReject;
		return this;
	}
	/**
	 * @param {(AddOnEvent|TimerAddOnEvent)} event
	 * @param {TimerAddOn} addon
	 * @param {*} data
	 * @return {Promise<void>}
	 */
	static async handleProcessLifecycle(event, addon, data) {
		let _tick = new TickEvent(event.context, this);

		event.context.log("Timer 'ticked' at '" + _tick.time.format() + "', last run on '" +
			              event.context.lastRun.format() + "'.",
			              LOG_LEVEL.INFO, "TimerAddOn.handleProcessLifecycle(context)");

		if(event.context.isPastDue && addon.rejectOnPastDue) {
			event.context.log("Timer tick is past due and rejectOnPastDue is true, rejecting...",
				                      LOG_LEVEL.WARN, "TimerAddOn.handleProcessLifecycle(context)");
			_tick.reject(CelastrinaError.newError("Timer past due. Tick time '" + _tick.time.format() +
				                                  "', last run '" + event.context.lastRun.format() + "'."));
		} else await event.source.onTick(_tick);

		if(_tick.isRejected) {
			event.context.log("Timer tick rejected.", LOG_LEVEL.WARN,
				              "TimerAddOn.handleProcessLifecycle(event, addon, data)");
			if(addon.abortOnReject) {
				event.context.log("Timer tick rejected and abortOnReject true, aborting...", LOG_LEVEL.WARN,
					              "TimerAddOn.handleProcessLifecycle(event, addon, data)");
				_tick.abort();
			}
			await event.source.onReject(_tick);
		}

		event.context.log("Next tick at '" + event.context.nextRun.format() + "'.",
			              LOG_LEVEL.INFO, "TimerAddOn.handleProcessLifecycle(context)");

		if(_tick.isAborted) {
			event.context.log("Timer tick aborted.", LOG_LEVEL.WARN,
				              "TimerAddOn.handleProcessLifecycle(event, addon, data)");
			await event.source.onAbort(_tick);
			if(_tick.cause == null) _tick.cause = CelastrinaError.newError("Internal Server Error.");
			event.context.log("Lady Miss Kier was wrong! You DO need a Clique to make a clock tick. \r\n" +
				                      "\t We're deee-lite'fully sorry, but this timer tick failed: " + _tick.cause,
				              LOG_LEVEL.WARN, "TimerAddOn.handleProcessLifecycle(event, addon, data)");
			throw CelastrinaError.newError("Timer Tick Aborted.", 500, true, _tick.cause);
		}
	}
}
module.exports = {
	TimerContext: TimerContext,
	TickEvent: TickEvent,
	TimerConfigLoader: TimerConfigLoader,
	TimerAddOn: TimerAddOn,
	TimerFunction: TimerFunction
};
