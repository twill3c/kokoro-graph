# T-030 / T-031: 起伏度指標の厳密検証(SPEC F-06 / G-04)
# 期待値はすべて SPEC の定義から手計算した(実装からの転記ではない)。
import math

from pipeline.metrics import (
    composite_volatility,
    moving_average,
    range_of,
    roughness,
    sd,
    sign_flips_per100,
)

EPS = 1e-9


def test_t030_roughness():
    xs = [0.0, 1.0, -1.0, 0.5]
    # |1-0| + |-1-1| + |0.5-(-1)| = 1 + 2 + 1.5 → /3
    assert abs(roughness(xs) - 1.5) < EPS
    assert roughness([3.0]) == 0.0
    assert roughness([]) == 0.0


def test_t030_sd_population():
    xs = [0.0, 1.0, -1.0, 0.5]
    # 平均 0.125、偏差平方和 = 35/16、母分散 = 35/64
    assert abs(sd(xs) - math.sqrt(35.0 / 64.0)) < EPS
    assert sd([2.0, 2.0, 2.0]) == 0.0
    assert sd([]) == 0.0


def test_t030_range():
    assert range_of([0.0, 1.0, -1.0, 0.5]) == 2.0
    assert range_of([0.5]) == 0.0
    assert range_of([]) == 0.0


def test_t031_moving_average_full_window():
    # 半径 7・n=4 → 全点で全要素平均
    xs = [0.0, 1.0, -1.0, 0.5]
    assert all(abs(v - 0.125) < EPS for v in moving_average(xs))
    assert moving_average([1.0, 2.0, 3.0]) == [2.0, 2.0, 2.0]
    assert moving_average([]) == []


def test_t030_sign_flips_per100():
    # 前半 8 個 +1・後半 8 個 -1 → 平滑化曲線は 1 回だけ符号反転
    xs = [1.0] * 8 + [-1.0] * 8
    assert abs(sign_flips_per100(xs) - 100.0 * 1 / 16) < EPS
    # 全零は反転なし
    assert sign_flips_per100([0.0] * 20) == 0.0
    assert sign_flips_per100([]) == 0.0


def test_t030_composite_minmax():
    metrics = [
        {"roughness": 0.0, "sd": 0.0, "range": 0.0, "flips100": 0.0},
        {"roughness": 1.0, "sd": 1.0, "range": 2.0, "flips100": 10.0},
        {"roughness": 0.5, "sd": 0.5, "range": 1.0, "flips100": 5.0},
    ]
    comp = composite_volatility(metrics)
    assert abs(comp[0] - 0.0) < EPS
    assert abs(comp[1] - 1.0) < EPS
    assert abs(comp[2] - 0.5) < EPS


def test_t030_composite_degenerate():
    # 全作品が同値の指標は寄与 0(min == max)
    metrics = [{"roughness": 1.0, "sd": 0.0, "range": 0.0, "flips100": 0.0}] * 3
    assert composite_volatility(metrics) == [0.0, 0.0, 0.0]
