const JobCard =
    require("../models/JobCard");


// ======================
// CREATE JOB CARD
// ======================

exports.createJobCard =
    async(req, res) => {

        try {

            const job =
                new JobCard(req.body);

            await job.save();

            res.status(201).json({

                success: true,

                message: "Job Card Submitted",

                data: job

            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message: "Error creating job card"

            });

        }

    };


// ======================
// GET ALL JOB CARDS
// ======================

exports.getJobCards =
    async(req, res) => {

        try {

            const jobs =
                await JobCard.find()
                .sort({ createdAt: -1 });

            res.status(200).json({

                success: true,

                count: jobs.length,

                data: jobs

            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message: "Error fetching jobs"

            });

        }

    };


// ======================
// UPDATE JOB CARD
// ======================

exports.updateJobCard =
    async(req, res) => {

        try {

            const updatedJob =

                await JobCard.findByIdAndUpdate(

                    req.params.id,

                    req.body,

                    {
                        new: true,
                        runValidators: true
                    }

                );

            if (!updatedJob) {

                return res.status(404)
                    .json({

                        success: false,

                        message: "Job card not found"

                    });

            }

            res.status(200).json({

                success: true,

                message: "Job Card Updated",

                data: updatedJob

            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message: "Update failed"

            });

        }

    };
exports.approveJobCard = async(req, res) => {
    try {
        const { managerComment, rating } = req.body;

        const jobCard = await JobCard.findByIdAndUpdate(
            req.params.id, {
                status: "Approved",
                managerComment,
                rating
            }, { new: true }
        );

        if (!jobCard) {
            return res.status(404).json({
                success: false,
                message: "Job card not found"
            });
        }

        res.json({
            success: true,
            message: "Job card approved successfully",
            data: jobCard
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.rejectJobCard = async(req, res) => {
    try {
        const { managerComment } = req.body;

        const jobCard = await JobCard.findByIdAndUpdate(
            req.params.id, {
                status: "Rejected",
                managerComment
            }, { new: true }
        );

        if (!jobCard) {
            return res.status(404).json({
                success: false,
                message: "Job card not found"
            });
        }

        res.json({
            success: true,
            message: "Job card rejected successfully",
            data: jobCard
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ======================
// JOB CARD RATING ANALYTICS
// ======================
exports.getRatingAnalytics = async(req, res) => {
    try {
        const { period = "monthly", month, year } = req.query;

        let filter = {};

        if (period === "monthly" && month && year) {
            const monthNumber = String(month).padStart(2, "0");
            const startDate = `${year}-${monthNumber}-01`;
            const endDate = `${year}-${monthNumber}-31`;

            filter.date = {
                $gte: startDate,
                $lte: endDate
            };
        }

        if (period === "yearly" && year) {
            filter.date = {
                $gte: `${year}-01-01`,
                $lte: `${year}-12-31`
            };
        }

        const jobCards = await JobCard.find(filter);

        const ratedCards = jobCards.filter(
            item => Number(item.rating) > 0
        );

        const totalRating = ratedCards.reduce(
            (sum, item) => sum + Number(item.rating),
            0
        );

        const avgRating =
            ratedCards.length > 0 ?
            Number((totalRating / ratedCards.length).toFixed(2)) :
            0;

        const teamMembers = new Set(
            jobCards.map(item => item.employeeName)
        ).size;

        const topPerformer = ratedCards.length > 0 ?
            ratedCards.reduce((best, current) =>
                Number(current.rating) > Number(best.rating) ?
                current :
                best
            ) :
            null;

        const distribution = {
            5: ratedCards.filter(item => Number(item.rating) === 5).length,
            4: ratedCards.filter(item => Number(item.rating) === 4).length,
            3: ratedCards.filter(item => Number(item.rating) === 3).length,
            2: ratedCards.filter(item => Number(item.rating) === 2).length,
            1: ratedCards.filter(item => Number(item.rating) === 1).length
        };

        const distributionPercent = {};

        Object.keys(distribution).forEach(key => {
            distributionPercent[key] =
                ratedCards.length > 0 ?
                Math.round((distribution[key] / ratedCards.length) * 100) :
                0;
        });

        res.status(200).json({
            success: true,
            data: {
                avgRating,
                teamMembers,
                cardsRated: ratedCards.length,
                topPerformer: topPerformer ? {
                    employeeName: topPerformer.employeeName,
                    rating: topPerformer.rating
                } : null,
                distribution,
                distributionPercent,
                cards: jobCards
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching rating analytics",
            error: error.message
        });
    }
};