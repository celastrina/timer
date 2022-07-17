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

const {MockAzureFunctionContext} = require("./AzureFunctionContextMock");
const {Configuration} = require("@celastrina/core");
const {TimerContext} = require("../Timer");
const assert = require("assert");
const moment = require("moment");

describe("TimerContext", () => {
	describe("Get tick attributes", () => {
		it("should access binding correctly", async () => {
			let _azcontext = new MockAzureFunctionContext();

			let now = moment();
			let fiveago = moment(now);
			let fivelater = moment(now);
			fiveago.subtract(5, "minutes");
			fivelater.add(5, "minutes");

			_azcontext.bindings.tick.isPastDue = false;
			_azcontext.bindings.tick.schedule.adjustForDST = false;
			_azcontext.bindings.tick.scheduleStatus.last = fiveago.format();
			_azcontext.bindings.tick.scheduleStatus.lastUpdated = now.format();
			_azcontext.bindings.tick.scheduleStatus.next = fivelater.format();

			now = moment(_azcontext.bindings.tick.scheduleStatus.lastUpdated);
			fiveago = moment(_azcontext.bindings.tick.scheduleStatus.last);
			fivelater = moment(_azcontext.bindings.tick.scheduleStatus.next);

			let _config = new Configuration("TimerContextTest");
			await _config.initialize(_azcontext);

			let _context = new TimerContext(_config);
			assert.strictEqual(_context.isPastDue, false, "Expected false.");
			assert.strictEqual(_context.adjustForDST, false, "Expected false.");
			assert.strictEqual(_context.lastRun.isSame(fiveago), true);
			assert.strictEqual(_context.lastUpdated.isSame(now), true);
			assert.strictEqual(_context.nextRun.isSame(fivelater), true);

			_azcontext.bindings.tick.isPastDue = true;
			_azcontext.bindings.tick.schedule.adjustForDST = true;
			_azcontext.bindings.tick.scheduleStatus.last = fiveago.format();
			_azcontext.bindings.tick.scheduleStatus.lastUpdated = now.format();
			_azcontext.bindings.tick.scheduleStatus.next = fivelater.format();

			_context = new TimerContext(_config);
			assert.strictEqual(_context.isPastDue, true, "Expected true.");
			assert.strictEqual(_context.adjustForDST, true, "Expected true.");
			assert.strictEqual(_context.lastRun.isSame(fiveago), true);
			assert.strictEqual(_context.lastUpdated.isSame(now), true);
			assert.strictEqual(_context.nextRun.isSame(fivelater), true);
		});
	});
});
