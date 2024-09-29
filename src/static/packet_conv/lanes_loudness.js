/**
 * @file Encoding/decoding functions for lanes-loudness packet
 *
 * @author aKuad
 */

import { typeof_detail } from "../typeof_detail.js";


/**
 * Packet type ID of lanes-loudness packet
 */
export const LANES_LOUDNESS_PACKET_TYPE_ID = 0x40;


export class LaneLoudness {
  /**
   * Data structure of a lane loudness
   *
   * @param {number} lane_id Lane ID
   * @param {number} current_loudness Lane current loudness
   *
   * @throws {TypeError} If `lane_id` is not `number`
   * @throws {TypeError} If `current_loudness` is not `number`
   * @throws {RangeError} If `lane_id` is not in 0~255
   * @throws {RangeError} If `current_loudness` is not in 0~255
   */
  constructor(lane_id, current_loudness) {
    // Arguments type checking
    if(typeof lane_id !== "number") {
      throw new TypeError(`lane_id must be number, but got ${typeof_detail(lane_id)}`);
    }
    if(typeof current_loudness !== "number") {
      throw new TypeError(`current_loudness must be number, but got ${typeof_detail(current_loudness)}`);
    }

    // Arguments range checking
    if(lane_id < 0 || lane_id > 255) {
      throw new RangeError(`lane_id must be 0~255, but got ${lane_id}`);
    }
    if(current_loudness < 0 || current_loudness > 255) {
      throw new RangeError(`current_loudness must be 0~255, but got ${current_loudness}`);
    }

    this.lane_id = lane_id;
    this.current_loudness = current_loudness;
  }


  /**
   * Instantiate `LaneLoudness` from bytes
   *
   * @param {Uint8Array} bytes Lane loudness data in bytes
   * @returns {LaneLoudness} Data contained LanesLoudness object
   *
   * @throws {TypeError} If `bytes` is not `Uint8Array`
   * @throws {RangeError} If `bytes` length is not 2 (1 data must be 2 bytes)
   */
  static from_bytes(bytes) {
    if(!(bytes instanceof Uint8Array)) {
      throw new TypeError(`bytes must be Uint8Array, but got ${typeof_detail(bytes)}`);
    }
    if(bytes.length !== 2) {
      throw new RangeError(`bytes must be 2, but got ${bytes.length}`);
    }

    const lane_id = bytes[0];
    const current_loudness = bytes[1];

    return new LaneLoudness(lane_id, current_loudness);
  }


  /**
   * Export `LaneLoudness` to bytes as a part of lane-loudness packet
   *
   * @returns {Uint8Array} Data struct in bytes as a part of lane-loudness packet
   */
  to_bytes() {
    return Uint8Array.of(this.lane_id, this.current_loudness);
  }
}


/**
 * Create lanes-loudness packet
 *
 * @param {Array<LaneLoudness>} lanes_loudness LaneLoudness array to encode
 * @returns {Uint8Array} Encoded packet
 *
 * @throws {TypeError} If `lanes_loudness` is not `Array`
 * @throws {RangeError} If `lanes_loudness` is empty array
 * @throws {TypeError} If `lanes_loudness` has non `LaneLoudness` elements
 */
export function packet_lanes_loudness_encode(lanes_loudness) {
  // Arguments type checking
  if(!(lanes_loudness instanceof Array)) {
    throw new TypeError(`lanes_loudness must be Array, but got ${typeof_detail(lanes_loudness)}`);
  }
  if(lanes_loudness.length === 0) {
    throw new RangeError("Empty array passed");
  }
  if(lanes_loudness.filter(e => !(e instanceof LaneLoudness)).length !== 0) {
    throw new TypeError("Non LaneLoudness elements detected");
  }

  const packet_body = lanes_loudness.flatMap(e => Array.from(e.to_bytes()));
  return Uint8Array.of(LANES_LOUDNESS_PACKET_TYPE_ID, ...packet_body);
}


/**
 * Unpack lanes-loudness packet
 *
 * Note: About raises, see reference of `is_lanes_loudness_packet`.
 *
 * @param {Uint8Array} raw_packet Encoded packet
 * @returns {Array<LaneLoudness>} Decoded data - Lane ID, current loudness
 */
export function packet_lanes_loudness_decode(raw_packet) {
  is_lanes_loudness_packet(raw_packet, true);

  const lanes_loudness = [];

  for(let i = 1; i < raw_packet.length; i += 2) {
    lanes_loudness.push(LaneLoudness.from_bytes(raw_packet.slice(i, i + 2)));
  }

  return lanes_loudness;
}


/**
 * Verify the packet is lanes_loudness packet
 *
 * @param {Uint8Array} raw_packet Packet to verify
 * @param {boolean} throw_on_invalid Toggle behavior when packet is invalid, true: raise exception, false: return false
 * @returns {boolean} It is an lanes_loudness: true, otherwise: false (if throw_on_invalid === true, error will be thrown)
 *
 * @throws {TypeError} If `raw_packet` is not `Uint8Array`
 * @throws {RangeError} If `raw_packet` is an empty array
 * @throws {RangeError} If `raw_packet` has not an lanes_loudness packet type ID
 * @throws {RangeError} If `raw_packet` is invalid length as lanes_loudness
 */
export function is_lanes_loudness_packet(raw_packet, throw_on_invalid = false) {
  try {
    // Arguments type checking
    if(!(raw_packet instanceof Uint8Array)) {
      throw new TypeError(`raw_packet must be Uint8Array, but got ${typeof_detail(raw_packet)}`);
    }

    // Packet content availability checking
    if(raw_packet.length === 0) {
      throw new RangeError("Empty array passed");
    }

    // Packet type ID checking
    if(raw_packet[0] !== LANES_LOUDNESS_PACKET_TYPE_ID) {
      throw new RangeError(`It has not an lanes_loudness packet type ID - should be ${LANES_LOUDNESS_PACKET_TYPE_ID}, but got ${raw_packet[0]}`);
    }

    // Packet length checking
    if(((raw_packet.length - 1) % 2) !== 0) {
      throw new RangeError("Invalid length bytes as lanes_loudness packet, may be broken");
    }

  } catch(e) {
    if(throw_on_invalid) {
      throw e;
    } else {
      return false;
    }
  }

  return true;
}
