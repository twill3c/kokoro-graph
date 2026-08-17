"""起伏度指標(SPEC F-06)。定義は SPEC §2 の表が正。"""

from __future__ import annotations

import math

MA_RADIUS = 7  # 移動平均: 中心窓・半径 7(窓 15)。端は縮小窓


def roughness(xs: list[float]) -> float:
    """粗さ = 隣接スコア差の平均絶対値。要素 1 以下は 0。"""
    if len(xs) < 2:
        return 0.0
    return sum(abs(b - a) for a, b in zip(xs, xs[1:])) / (len(xs) - 1)


def sd(xs: list[float]) -> float:
    """母集団標準偏差。空は 0。"""
    if not xs:
        return 0.0
    mean = sum(xs) / len(xs)
    return math.sqrt(sum((x - mean) ** 2 for x in xs) / len(xs))


def range_of(xs: list[float]) -> float:
    if not xs:
        return 0.0
    return max(xs) - min(xs)


def moving_average(xs: list[float]) -> list[float]:
    out = []
    n = len(xs)
    for i in range(n):
        lo = max(0, i - MA_RADIUS)
        hi = min(n, i + MA_RADIUS + 1)
        out.append(sum(xs[lo:hi]) / (hi - lo))
    return out


def sign_flips_per100(xs: list[float]) -> float:
    """転調率 = 平滑化曲線の符号反転回数(0 は無視)を 100 行あたりに正規化。"""
    if not xs:
        return 0.0
    smoothed = moving_average(xs)
    flips = 0
    last = 0
    for v in smoothed:
        s = 1 if v > 0 else (-1 if v < 0 else 0)
        if s == 0:
            continue
        if last != 0 and s != last:
            flips += 1
        last = s
    return 100.0 * flips / len(xs)


def work_metrics(xs: list[float]) -> dict:
    return {
        "roughness": roughness(xs),
        "sd": sd(xs),
        "range": range_of(xs),
        "flips100": sign_flips_per100(xs),
        "mean": (sum(xs) / len(xs)) if xs else 0.0,
    }


def composite_volatility(metrics: list[dict]) -> list[float]:
    """合成起伏度 = 4 指標のコーパス内 min-max 正規化の平均。min==max の指標は寄与 0。"""
    keys = ["roughness", "sd", "range", "flips100"]
    lo = {k: min(m[k] for m in metrics) for k in keys}
    hi = {k: max(m[k] for m in metrics) for k in keys}
    out = []
    for m in metrics:
        acc = 0.0
        for k in keys:
            span = hi[k] - lo[k]
            acc += (m[k] - lo[k]) / span if span > 0 else 0.0
        out.append(acc / len(keys))
    return out
