const JobCard =
require("../models/JobCard");

exports.createJobCard =
async (req,res)=>{

  const job =
  new JobCard(req.body);

  await job.save();

  res.json({
    message:"Job Card Submitted"
  });
};

exports.getJobCards =
async (req,res)=>{

  const jobs =
  await JobCard.find();

  res.json(jobs);
};

exports.updateJobCard =
async (req,res)=>{

  await JobCard.findByIdAndUpdate(
    req.params.id,
    req.body
  );

  res.json({
    message:"Updated"
  });
};