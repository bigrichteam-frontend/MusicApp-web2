$(function () {
    //隐藏错误提示框
    $('.add-error-info').css("display", "none");
    $('.edit-error-info').css("display", "none");

    $("#jqGrid").jqGrid({
        url: 'http://127.0.0.1:8888/singer/page',
        datatype: "json",
        colModel: [
            {label: '编号', name: 'id', index: 'id', width: 50, hidden: true, key: true},
            {label: '歌手名', name: 'cName', index: 'cName', sortable: false, width: 80},
            {label: '英文名', name: 'name', index: 'name', sortable: false, width: 80},
            {label: '性别', name: 'sex', index: 'sex', sortable: false, width: 80},
            {label: '国籍', name: 'country', index: 'country', sortable: false, width: 60},
            {label: '出生时间', name: 'brth', index: 'brth', sortable: false, width: 100},
            {label: '体重', name: 'weight', index: 'weight', sortable: false, width: 80},
            {label: '星座', name: 'xingZuo', index: 'xingZuo', sortable: false, width: 80},
            {label: '头像', name: 'headUrl', index: 'headUrl', sortable: false, width: 80, formatter: imgFormatter},
            {label: '个人简介', name: 'info', index: 'info', sortable: false, width: 180}
        ],
        height: 485,
        rowNum: 10,
        rowList: [10, 30, 50],
        styleUI: 'Bootstrap',
        loadtext: '信息读取中...',
        rownumbers: true,
        rownumWidth: 35,
        autowidth: true,
        multiselect: true,
        pager: "#jqGridPager",
        jsonReader: {
            root: "items",
            page: "currPage",
            total: "totalPage",
            records: "total"
        },
        prmNames: {
            page: "page",
            rows: "limit",
            order: "order"
        },
        gridComplete: function () {
            //隐藏grid底部滚动条
            $("#jqGrid").closest(".ui-jqgrid-bdiv").css({"overflow-x": "hidden"});
        }
    });
    function imgFormatter(cellvalue) {
        return "<a href='" + cellvalue + "'> <img src='" + cellvalue + "' height=\"120\" width=\"135\" alt='path'/></a>";
    }

    //importV1
    new AjaxUpload('#importV1Button', {
        action: 'users/importV1',
        name: 'file',
        autoSubmit: true,
        responseType: "json",
        onSubmit: function (file, extension) {
            if (!(extension && /^(xlsx)$/.test(extension.toLowerCase()))) {
                swal('只支持xlsx格式的文件！', {
                    icon: "error",
                });
                return false;
            }
        },
        onComplete: function (file, r) {
            if (r.resultCode == 200) {
                swal("成功导入" + r.data + "条记录！", {
                    icon: "success",
                });
                reload();
                return false;
            } else {
                swal(r.message, {
                    icon: "error",
                });
            }
        }
    });

    //importV2
    new AjaxUpload('#uploadExcelV2', {
        action: 'upload/file',
        name: 'file',
        autoSubmit: true,
        responseType: "json",
        onSubmit: function (file, extension) {
            if (!(extension && /^(xlsx)$/.test(extension.toLowerCase()))) {
                swal('只支持xlsx格式的文件！', {
                    icon: "error",
                });
                return false;
            }
        },
        onComplete: function (file, r) {
            if (r.resultCode == 200) {
                console.log(r);
                $("#fileUrl").val(r.data);
                return false;
            } else {
                swal(r.message, {
                    icon: "error",
                });
            }
        }
    });
});

function userAdd() {
    //点击添加按钮后执行操作
    var modal = new Custombox.modal({
        content: {
            effect: 'fadein',
            target: '#modalAdd'
        }
    });
    modal.open();
}

function search() {
    //标题关键字
    var keyword = $('#keyword').val();
    if (isNull(keyword)){
        return;
    }
    if (!validLength(keyword, 20)) {
        swal("搜索字段长度过大!", {
            icon: "error",
        });
        return false;
    }
//数据封装
    var searchData = {"searchkey":keyword};
    //传入查询条件参数
    $("#jqGrid").jqGrid("setGridParam",{postData: searchData});
    //点击搜索按钮默认都从第一页开始
    $("#jqGrid").jqGrid("setGridParam", {page: 1});
    //提交post并刷新表格
    $("#jqGrid").jqGrid("setGridParam", {url: 'http://127.0.0.1:8888/singer/page'}).trigger("reloadGrid");
}

function initFlatPickr() {
    $('.startTime').flatpickr();
    $('.endTime').flatpickr();
    //创建一个当前日期对象
    var now = new Date();
    //格式化日，如果小于9，前面补0
    var day = ("0" + now.getDate()).slice(-2);
    //格式化月，如果小于9，前面补0
    var month = ("0" + (now.getMonth() + 1)).slice(-2);
    //小时
    var hour = ("0" + now.getHours()).slice(-2);
    //分钟
    var minute = ("0" + now.getMinutes()).slice(-2);
    //秒
    var seconds = ("0" + now.getSeconds()).slice(-2);
    //拼装完整日期格式
    var todayTime = now.getFullYear() + "-" + (month) + "-" + (day) + " 00:00:00";
    var nowTime = now.getFullYear() + "-" + (month) + "-" + (day) + " " + hour + ":" + minute + ":" + seconds;
    $('.startTime').val(todayTime);
    $('.endTime').val(nowTime);
}

function userEdit() {

    $("#informations").val("");
    var id = getSelectedRow();
    if (id == null) {
        return;
    }

    $('#userId').val(id);

    //点击编辑按钮后执行操作
    var modal = new Custombox.modal({
        content: {
            effect: 'fadein',
            target: '#modalEdit'
        }
    });
    modal.open();
}

//绑定modal上的保存按钮
$('#saveButton').click(function () {
   
        //一切正常后发送网络请求
        //ajax
        var name = $("#singer").val();
        var cName = $("#EnglishName").val();
        var sex = $("#sex").val();
        var country = $("#nationality").val(); //国籍
        var language = $("#place").val();
         var brth = $("#birthday").val();
       var weight = $("#weight").val();
       var xingZuo = $("#constellation").val();//星座
      var headUrl = "testUrl";
      var info = $("#information").val();
        var data = {"name": name, "cName": cName,"sex":sex,"country":country,"language":language,"brth":brth,
        "weight":weight,"xingZuo":xingZuo,"headUrl":headUrl,"info":info
        };
        $.ajax({
            type: 'POST',//方法类型
            //dataType: "json",//预期服务器返回的数据类型
            url: 'http://127.0.0.1:8888/singer/addSinger',//url
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            success: function (result) {

                if (result.code == 500) {
                    closeModal();
                    swal("保存成功", {
                        icon: "error",
                    });
                }
                else {
                    closeModal();
                    swal("保存成功", {
                        icon: "success",
                    });
                    //reload
                    reload();
                }
                ;
            },
            error: function () {
                reset();
                swal("操作失败", {
                    icon: "error",
                });
            }
        });


});

//绑定modal上的编辑按钮
$('#editButton').click(function () {
    
   
        //一切正常后发送网络请求
        var information = $("#informations").val();
        var id = $("#userId").val();
        var data = {"sid": id, "information": information};
        $.ajax({
            type: 'POST',//方法类型
            //dataType: "json",//预期服务器返回的数据类型
            url: 'http://127.0.0.1:8888/singer/update',//url
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            success: function (result) {
                if(result.code==299){
                    swal(result.msg, {
                        icon: "error",
                    });
                    //closeModal();
                    return;
                }
                   reload();
                   closeModal();

                     swal(result, {
                        icon: "success",
                    });

            },
            error: function () {
                reset();
                swal("添加失败", {
                    icon: "error",
                });
            }
        });


});

//绑定modal上的编辑按钮
$('#importV2Button').click(function () {
    var fileUrl = $("#fileUrl").val();
    $.ajax({
        type: 'POST',
        dataType: "json",
        url: 'users/importV2?fileUrl=' + fileUrl,
        contentType: "application/json; charset=utf-8",
        success: function (result) {
            checkResultCode(result.resultCode);
            console.log(result);
            if (result.resultCode == 200) {
                closeModal();
                reload();
                swal("成功导入" + result.data + "条记录！", {
                    icon: "success",
                });
            }
            else {
                closeModal();
                swal(result.message, {
                    icon: "error",
                });
            }
            ;
        },
        error: function () {
            reset();
            swal("操作失败", {
                icon: "error",
            });
        }
    });
});

/**
 * 用户删除
 */
function userDel() {
    var ids = getSelectedRows();

    if (ids == null) {
        return;
    }

            $.ajax({
                type: "POST",
                //dataType: "json",
                url: "http://127.0.0.1:8888/singer/delete",
                contentType: "application/json",
                data: JSON.stringify(ids),
                success: function (r) {
                    if (r.code == 500) {
                        swal(r.message, {
                            icon: "error",
                        });
                    } else {
                        swal(r, {
                            icon: "success",
                        });
                        $("#jqGrid").trigger("reloadGrid");
                    }
                }
            });


}

/**
 * 用户导入功能V2
 */
function importV2() {
    //点击编辑按钮后执行操作
    var modal = new Custombox.modal({
        content: {
            effect: 'fadein',
            target: '#importV2Modal'
        }
    });
    modal.open();
}


//添加Modal关闭
$('#cancelAdd').click(function () {
    closeModal();
})

//编辑Modal关闭
$('#cancelEdit').click(function () {
    closeModal();
})

//导入Modal关闭
$('#cancelImportV2').click(function () {
    closeModal();
})

/**
 * 数据验证
 */
function validObjectForAdd() {
    var userName = $('#userName').val();
    if (isNull(userName)) {
        showErrorInfo("用户名不能为空!");
        return false;
    }
    if (!validUserName(userName)) {
        showErrorInfo("请输入符合规范的用户名!");
        return false;
    }
    var password = $('#password').val();
    if (isNull(password)) {
        showErrorInfo("密码不能为空!");
        return false;
    }
    if (!validPassword(password)) {
        showErrorInfo("请输入符合规范的密码!");
        return false;
    }
    return true;
}

/**
 * 数据验证
 */
function validObjectForEdit() {
    var userId = $('#userId').val();
    if (isNull(userId) || userId < 1) {
        showErrorInfo("数据错误！");
        return false;
    }
    var password = $('#passwordEdit').val();
    if (isNull(password)) {
        showErrorInfo("密码不能为空!");
        return false;
    }
    if (!validPassword(password)) {
        showErrorInfo("请输入符合规范的密码!");
        return false;
    }
    return true;
}

/**
 * 关闭modal
 */
function closeModal() {
    //关闭前清空输入框数据
    reset();
    Custombox.modal.closeAll();
}

/**
 * 重置
 */
function reset() {
    //隐藏错误提示框
    $('.add-error-info').css("display", "none");
    $('.edit-error-info').css("display", "none");
    //清空数据
    $('#password').val('');
    $('#passwordEdit').val('');
    $('#userName').val('');
}

/**
 * jqGrid重新加载
 */
function reload() {
    reset();
    var page = $("#jqGrid").jqGrid('getGridParam', 'page');
    $("#jqGrid").jqGrid('setGridParam', {
        page: page
    }).trigger("reloadGrid");
}