function OD(a, b, c) {
    while (a > c) a -= c - b;
    while (a < b) a += c - b;
    return a;
}
function SD(a, b, c) {
    b != null && (a = Math.max(a, b));
    c != null && (a = Math.min(a, c));
    return a;
}
function getDistance(a_lat, a_lng, b_lat, b_lng) {
    var a = Math.PI * OD(a_lat, -180, 180) / 180;
    var b = Math.PI * OD(b_lat, -180, 180) / 180;
    var c = Math.PI * SD(a_lng, -74, 74) / 180;
    var d = Math.PI * SD(b_lng, -74, 74) / 180;
    return 6370996.81 * Math.acos(Math.sin(c) * Math.sin(d) + Math.cos(c) * Math.cos(d) * Math.cos(b - a));
}
function formatLessThan10(num) {
    return num < 10 ? "0" + num : num
}
module.exports = {
    OD, SD, getDistance,formatLessThan10
}
