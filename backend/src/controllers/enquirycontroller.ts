import { Request, Response } from "express";
import Enquiry from "../models/enquiry";

export const createEnquiry = async (req: Request, res: Response) => {
  try {
    const enquiry = await Enquiry.create(req.body);
    res.status(201).json(enquiry);
  } catch (error) {
    res.status(500).json({ message: "Failed to create enquiry" });
  }
};

export const getEnquiries = async (req: Request, res: Response) => {
  try {
    const enquiries = await Enquiry.find();
    res.json(enquiries);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch enquiries" });
  }
};