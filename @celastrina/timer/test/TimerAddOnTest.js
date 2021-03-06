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
const {Configuration, AddOnEventHandler, AddOnEvent} = require("@celastrina/core");
const {MockAzureFunctionContext} = require("./AzureFunctionContextMock");
const assert = require("assert");
const {TimerAddOn} = require("../Timer");

describe("TimerAddOn", () => {
	describe("#constructor(rejectOnPastDue, abortOnReject)", () => {
		it("Should set defaults", () => {
			let _addon = new TimerAddOn();
			assert.strictEqual(_addon.rejectOnPastDue, false, "Expected false");
			assert.strictEqual(_addon.abortOnReject, false, "Expected false");
		});
		it("Should set reject", () => {
			let _addon = new TimerAddOn(true);
			assert.strictEqual(_addon.rejectOnPastDue, true, "Expected true.");
			assert.strictEqual(_addon.abortOnReject, false, "Expected false.");
		});
		it("Should set abort", () => {
			let _addon = new TimerAddOn(false, true);
			assert.strictEqual(_addon.rejectOnPastDue, false, "Expected false.");
			assert.strictEqual(_addon.abortOnReject, true, "Expected true.");
		});
		it("Should set reject and abort", () => {
			let _addon = new TimerAddOn(true, true);
			assert.strictEqual(_addon.rejectOnPastDue, true, "Expected true.");
			assert.strictEqual(_addon.abortOnReject, true, "Expected true.");
		});
	});
	describe("Get/Set", () => {
		it("Should set abort", () => {
			let _addon = new TimerAddOn();
			_addon.abortOnReject = true;
			assert.strictEqual(_addon.abortOnReject, true, "Expected true.");
			_addon.abortOnReject = false;
			assert.strictEqual(_addon.abortOnReject, false, "Expected false.");
			assert.deepStrictEqual(_addon.setAbortOnReject(true), _addon, "Expected _addon.");
			assert.strictEqual(_addon.abortOnReject, true, "Expected true.");
		});
		it("Should set reject", () => {
			let _addon = new TimerAddOn();
			_addon.rejectOnPastDue = true;
			assert.strictEqual(_addon.rejectOnPastDue, true, "Expected true.");
			_addon.rejectOnPastDue = false;
			assert.strictEqual(_addon.rejectOnPastDue, false, "Expected false.");
			assert.deepStrictEqual(_addon.setRejectOnPastDue(true), _addon, "Expected _addon.");
			assert.strictEqual(_addon.rejectOnPastDue, true, "Expected true.");
		});
	});
	describe("#install(_azcontext, _config, _handler)", () => {
		describe("Optimistic AuthZ", () => {
			it("should set optimistic auth to true", async () => {
				let _azcontext = new MockAzureFunctionContext();
				let _config = {};
				let _handler = new AddOnEventHandler();
				let _addon = new TimerAddOn();

				await _addon.install(_azcontext, _config, _handler);
				assert.strictEqual(_config[Configuration.CONFIG_AUTHORIATION_OPTIMISTIC], true, "Expected true.");
			});
		});
		describe("Life-cycle listeners", () => {
			it("Should register for process listener.", async () => {
				let _azcontext = new MockAzureFunctionContext();
				let _config = {};
				let _handler = new AddOnEventHandler();
				let _addon = new TimerAddOn();

				await _addon.install(_azcontext, _config, _handler);

				let _listener = _handler._listeners.get(AddOnEvent.TYPE.BEFORE_PROCESS);

				assert.strictEqual((typeof _listener !== "undefined" || _listener != null), true, "Expected BEFORE_PROCESS listener.");
			});
		});
	});
});
