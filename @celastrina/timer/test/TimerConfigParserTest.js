/*
 * Copyright (c) 2020, Robert R Murrell.
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
const {AddOnManager} = require("@celastrina/core");
const {MockAzureFunctionContext} = require("./AzureFunctionContextMock");
const assert = require("assert");
const {TimerAddOn, TimerConfigLoader} = require("../Timer");

describe("TimerConfigParser", () => {
	describe("#parse(_Object)", () => {
		it("should parse timer properties.", async () => {
			let _parser = new TimerConfigLoader();
			let _config = {};
			let _Object = {
				$object: {
					contentType: "application/vnd.celastrinajs.config+json;Timer"
				},
				rejectOnPastDue: true,
				abortOnReject: true
			};
			await _parser.load(_Object, _config);
			assert.strictEqual(_config.hasOwnProperty(TimerAddOn.CONFIG_TIMER), true, "Expected CONFIG_TIMER set.");
			let _configtimer = _config[TimerAddOn.CONFIG_TIMER];
			assert.strictEqual(_configtimer.abortOnReject, true, "Expected true.");
			assert.strictEqual(_configtimer.rejectOnPastDue, true, "Expected true.");
		});
	});
});
