/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 *
 * �����w�b�_�[�̉�ʃ��[�h�̏���
 *
 * Version    Date            Author           Remarks
 * 1.00       2018/01/09      Astop            Initial
 *
 */
define(['N/ui/serverWidget','N/url','N/runtime','N/record', 'N/redirect', 'N/search', 'N/task'],

function(serverWidget,url,runtime,record, redirect, search, task) {

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {
    	try{
        if (scriptContext.type === scriptContext.UserEventType.VIEW){
        	//�X�e�[�^�X�Ɋ֌W�Ȃ��u�X�V�{�^����\������v
        	var form = scriptContext.form;
            form.addButton({
              id: 'custpage_refresh',
              label: '�X�V',
              functionName: 'btnUpdateButton();'
            });
            
          var cs_file_id = runtime.getCurrentScript().getParameter("custscript_headview_cs_file");
          var currentRecord = scriptContext.newRecord;
          var form = scriptContext.form;
          var status = currentRecord.getValue('custrecord_sii_custpayment_status');
          form.clientScriptFileId = cs_file_id;
        }
    		if (scriptContext.type === scriptContext.UserEventType.EDIT){
          var currentRecord = scriptContext.newRecord;
          /**
           * //�y�X�e�[�^�X�ω��z
           * 1.�����f�[�^�捞��
           ���J�n��ԁB�����Ǘ��[�Ɉړ��\�B
           2.�����������s��
           ���u���s�v�{�^���������B�����Ǘ��[�Ɉړ��s�\�B
           3.������������
           ���d��A�����[�����������B�����Ǘ��[�Ɉړ��s�\�B
           4.���������G���[
           ���d�󐶐��y�ѓ����[�������s���B�����Ǘ��[�Ɉړ��\�B
           */
          var status = currentRecord.getValue('custrecord_sii_custpayment_status');
          if(status === '1' || status === '5'){
            redirect.toSuitelet({
              scriptId: 'customscript_sii_sl_paymentmanagement' ,
              deploymentId: 'customdeploy_sii_sl_paymentmanagement',
              parameters: {'custscript_custpayment_head_id': currentRecord.id}
            });
          }

    		  if(status === '3' || status === '4'){
            redirect.toRecord({
              type : 'customrecord_sii_custpayment_h',
              id : currentRecord.id
            });
          }
    		    //log.debug('Record: ' + currentRecord.id);
    		}
            /*if(scriptContext.type === scriptContext.UserEventType.VIEW){
                var form = scriptContext.form;
                var currentRecord = scriptContext.newRecord;
                form.addButton({
                    id : 'custpage_print_receipt',
                    label : '���s',
                    functionName: "window.history.go(-1);"
                });
            }*/
    	}catch(e){
    		log.error('UE: ' + e.name);
    	}
    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {
        try{
            if (scriptContext.type === scriptContext.UserEventType.CREATE){
                var currentRecord = scriptContext.newRecord;
                var customerArray = getCustomer();
                var numLines = currentRecord.getLineCount({
                    sublistId: 'recmachcustrecord_sii_custpayment_h_id'
                });
                for(var i = 0; i < numLines; i++){
                    var client_half = currentRecord.getSublistValue({
                        sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                        fieldId: 'custrecord_sii_custpayment_client_half',
                        line: i
                    });
                    client_half = client_half.replace(/\s/g, '');
                    client_half = convertKanaToOneByte(client_half);
                    for(var m =0; m < customerArray.length; m++){
                        var hankakukana_name = customerArray[m].getValue({name: 'custentity_hankakukana_name'});
                        hankakukana_name = hankakukana_name.replace(/\s/g, '');
                        hankakukana_name = convertKanaToOneByte(hankakukana_name);
                        var entityid = customerArray[m].getValue({name: 'entityid'});
                        if(hankakukana_name ==  client_half){
                            currentRecord.setSublistValue({
                                sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                                fieldId: 'custrecord_sii_custpayment_customerno',
                                value: entityid,
                                line: i
                            });
                            currentRecord.setSublistValue({
                                sublistId: 'recmachcustrecord_sii_custpayment_h_id',
                                fieldId: 'custrecord_sii_custpayment_client',
                                value: customerArray[m].id,
                                line: i
                            });
                            break;
                        }
                    }
                }
                var scriptObj = runtime.getCurrentScript();
                log.audit("Remaining governance units: " + scriptObj.getRemainingUsage());
            }
        }catch(e){
            log.error('UE: ' + e);
        }
    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {
      try{
        var currentRecord = scriptContext.newRecord;
        var status = currentRecord.getValue('custrecord_sii_custpayment_status');
        log.audit({
          title: 'afterSubmit audit',
          details: status
        });
        if(status === '1' || status === '5'){
        }
        if(status === '3'){
          //Scheduled Script call
          var scriptTask = task.create({taskType: task.TaskType.SCHEDULED_SCRIPT});
          scriptTask.scriptId = 'customscript_sii_ss_create_journal_custp';
          scriptTask.deploymentId = 'customdeploy_sii_ss_create_journal_custp';
          scriptTask.params = {custscripthead_id: currentRecord.id};
          var scriptTaskId = scriptTask.submit();
        }
      }catch (e){
        log.error('UE afterSubmit :' + e);
      }
    }

    function getCustomer(){
        var SLICE_LIMIT = 1000;
        var myCustomerListSearch = search.create({
            type: search.Type.CUSTOMER,
            columns: [{
                name: 'entityid'
            }, {
                name: 'custentity_hankakukana_name'
            }]
        });
        var resultSet = myCustomerListSearch.run();
        var customerArray = resultSet.getRange({
            start: 0,
            end: SLICE_LIMIT
        });
        return( customerArray );
    }

    function createKanaMap(properties, values) {
        var kanaMap = {};
        // �O�̂��ߕ��������������ǂ������`�F�b�N����(�����ƃ}�b�s���O�ł��邩)
        if(properties.length === values.length) {
            for(var i=0, len=properties.length; i<len; i++) {
                var property= properties.charCodeAt(i),
                    value = values.charCodeAt(i);
                kanaMap[property] = value;
            }
        }
        return kanaMap;
    };

    // �S�p���甼�p�ւ̕ϊ��p�}�b�v
    var m = createKanaMap(
        '�A�C�E�G�I�J�L�N�P�R�T�V�X�Z�\�^�`�c�e�g�i�j�k�l�m�n�q�t�w�z�}�~�����������������������������@�B�D�F�H�b������',
        '�������������������������������������������ܦݧ��������'
    );
    // ���p����S�p�ւ̕ϊ��p�}�b�v
    /*var mm = createKanaMap(
        '�������������������������������������������ܦݧ��������',
        '�A�C�E�G�I�J�L�N�P�R�T�V�X�Z�\�^�`�c�e�g�i�j�k�l�m�n�q�t�w�z�}�~�����������������������������@�B�D�F�H�b������'
    );*/

    // �S�p���甼�p�ւ̕ϊ��p�}�b�v
    var g = createKanaMap(
        '�K�M�O�Q�S�U�W�Y�[�]�_�a�d�f�h�o�r�u�x�{',
        '��������������������'
    );
    // ���p����S�p�ւ̕ϊ��p�}�b�v
    /*var gg = createKanaMap(
        '��������������������',
        '�K�M�O�Q�S�U�W�Y�[�]�_�a�d�f�h�o�r�u�x�{'
    );*/

    // �S�p���甼�p�ւ̕ϊ��p�}�b�v
    var p = createKanaMap(
        '�p�s�v�y�|',
        '�����'
    );
    // ���p����S�p�ւ̕ϊ��p�}�b�v
    /*var pp = createKanaMap(
        '�����',
        '�p�s�v�y�|'
    );*/

    var gMark = '�'.charCodeAt(0);
    var pMark = '�'.charCodeAt(0);

    function convertKanaToOneByte(str){
        for(var i=0, len=str.length; i<len; i++) {
            if(g.hasOwnProperty(str.charCodeAt(i)) || p.hasOwnProperty(str.charCodeAt(i))) {
                if(g[str.charCodeAt(i)]) {
                    str = str.replace(str[i], String.fromCharCode(g[str.charCodeAt(i)])+String.fromCharCode(gMark));
                }else if(p[str.charCodeAt(i)]) {
                    str = str.replace(str[i], String.fromCharCode(p[str.charCodeAt(i)])+String.fromCharCode(pMark));
                }else {
                    break;
                }
                i++;
                len = str.length;
            }else {
                if(m[str.charCodeAt(i)]) {
                    str = str.replace(str[i], String.fromCharCode(m[str.charCodeAt(i)]));
                }
            }
        }
        return str;
    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };

});
