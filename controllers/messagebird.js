
exports.SendMessage = async (req, res) => {
    try {
        var params = {
            originator: 'INNUAA',
            type: 'sms'
        };
        MessageBird.verify.create(req.query.phone, params, async (err, response) => {
            if (!err) {
                res.status(200).json({ type: "success", result: response });
                return;
            }
            res.status(500).json({ type: "failure", result: err });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ type: "failure", result: "Server Not Responding" });
    }
}

exports.OnVerifyMessage = async (req, res) => {
    try {
        const token = req.query.token;
        const id = req.query.responseId;
        MessageBird.verify.verify(id, token, async (err, response) => {
            if (!err) {
                console.log(response);
                res.status(200).json({ type: "success", result: response });
                return;
            }
            res.status(500).json({ type: "failure", result: err });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ type: "failure", result: "Server Not Responding" });
    }
}