exports.timeFormatter = async (req, res, next) => {
    const startTime = req.body.startTime;
    const endTime = req.body.endTime;
    var startArray = startTime.split(":");
    var endArray = endTime.split(":");
    req.body.startTime = {
        hour: startArray[0],
        minute: startArray[1]
    }
    req.body.endTime = {
        hour: endArray[0],
        minute: endArray[1]
    }
    next();
}