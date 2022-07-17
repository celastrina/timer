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
const {Configuration, Context} = require("@celastrina/core");
const {TickEvent} = require("../Timer");
const {MockAzureFunctionContext} = require("./AzureFunctionContextMock");
const moment = require("moment");
const assert = require("assert");

describe("TickEvent", () => {
	describe("#constructor()", () => {
		it("sets defaults", () => {
			let _tick = new TickEvent(null);
			assert.strictEqual(_tick.isAborted, false, "expected false.");
		});
	});
	describe("Getters/Setters", () => {
		describe("abort", () => {
			it("sets abort and reject on abort", () => {
				let _tick = new TickEvent(null);
				_tick.abort();
				assert.strictEqual(_tick.isAborted, true, "expected false.");
				assert.strictEqual(_tick.isRejected, true, "expected false.");
			});
		});
	});
});
