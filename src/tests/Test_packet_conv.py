# coding: UTF-8
"""Tests for ``packet_conv.py``

Test cases:
  * Can convert audio data in ``ndarray`` with[out] custom bytes to bytes, and reverse convert
  * Can convert audio data in ``AudioSegment`` with[out] custom bytes to bytes, and reverse convert

Test steps:
  1. Set current here
  2. Run this

Author:
  aKuad

"""

# For import top layer module
import sys
from pathlib import Path
sys.path.append(Path(__file__).absolute().parent.parent.__str__())


import unittest

import numpy as np
from pydub import AudioSegment

import packet_conv
import AUDIO_PARAM


class Test_packet_conv(unittest.TestCase):
  def test_packet_enc_dec_ndarray_ext(self):
    aud_org = part_create_testdata_ndarray()
    ext_org = bytes([1, 2, 3, 4])

    packet = packet_conv.packet_enc_ndarray(aud_org, ext_org)
    aud_prc, ext_prc = packet_conv.packet_dec_ndarray(packet)

    self.assertTrue((aud_org == aud_prc).all())
    self.assertEqual(ext_org, ext_prc)


  def test_packet_enc_dec_ndarray_noext(self):
    aud_org = part_create_testdata_ndarray()
    ext_org = bytes()

    packet = packet_conv.packet_enc_ndarray(aud_org, ext_org)
    aud_prc, ext_prc = packet_conv.packet_dec_ndarray(packet)

    self.assertTrue((aud_org == aud_prc).all())
    self.assertEqual(ext_org, ext_prc)


  def test_packet_enc_dec_audioseg_ext(self):
    aud_org = part_create_testdata_audioseg()
    ext_org = bytes([1, 2, 3, 4])

    packet = packet_conv.packet_enc_audioseg(aud_org, ext_org)
    aud_prc, ext_prc = packet_conv.packet_dec_audioseg(packet)

    self.assertEqual(aud_org, aud_prc)
    self.assertEqual(ext_org, ext_prc)


  def test_packet_enc_dec_audioseg_noext(self):
    aud_org = part_create_testdata_audioseg()
    ext_org = bytes()

    packet = packet_conv.packet_enc_audioseg(aud_org, ext_org)
    aud_prc, ext_prc = packet_conv.packet_dec_audioseg(packet)

    self.assertEqual(aud_org, aud_prc)
    self.assertEqual(ext_org, ext_prc)


def part_create_testdata_ndarray() -> np.ndarray:
  x = np.arange(AUDIO_PARAM.SAMPLE_RATE)
  x = np.deg2rad(x)
  y = np.sin(x) * 8 * (AUDIO_PARAM.SAMPLE_WIDTH - 1)
  return np.int16(y).reshape(-1, 1)


def part_create_testdata_audioseg() -> AudioSegment:
  raw = part_create_testdata_ndarray().tobytes()
  return AudioSegment(raw, sample_width=AUDIO_PARAM.SAMPLE_WIDTH, frame_rate=AUDIO_PARAM.SAMPLE_RATE, channels=AUDIO_PARAM.CHANNELS)


if __name__ == "__main__":
  unittest.main(verbosity=2)
