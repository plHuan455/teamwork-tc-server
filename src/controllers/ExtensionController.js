import noteModel from '../models/note.js';
import noteTodoModel from '../models/noteTodo.js';
import { addZeroToNumber } from '../ultilities/index.js';

class ExtensionController {
  /**
   * [POST] /api/extension/bank-manager
   * @param {*} req 
   * @param {*} res 
   */
  async PostBankManage(req, res){
    const {content, time, groupId, color, money} = req.body;
    try{
      if(!content || !time || !groupId || !money) return res.status(400).json({success: false});

      const timeDate = new Date(time);
      if(!isFinite(timeDate)) {
        return res.status(400).json({success: false, message: 'Time type error'});
      }
      const newNote = { 
        from: timeDate,
        to: timeDate,
        color,
        name: `[${money}] [${addZeroToNumber(timeDate.getHours())}:${addZeroToNumber(timeDate.getMinutes())}] ${content}`,
        groupId
      }
      const createdNote = await noteModel.create(newNote);
      return res.json({data: createdNote})
    }catch(err){
      console.log(`[BANK-MANAGER-ERROR]: ${err}`);
      return res.status(500).json({status: 500, message: 'Internal Server'});
    }
  }
}

export default new ExtensionController