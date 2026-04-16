import Table from "../models/Table.js";

export const getTables = async (req, res) => {
  const tables = await Table.find().sort({ number: 1 });
  res.json(tables);
};

export const createTable = async (req, res) => {
  const table = new Table(req.body);
  await table.save();
  res.status(201).json(table);
};

export const updateTable = async (req, res) => {
  const table = await Table.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(table);
};

export const deleteTable = async (req, res) => {
  await Table.findByIdAndDelete(req.params.id);
  res.json({ message: "Mesa eliminada" });
};