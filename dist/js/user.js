$(function () {
    //隐藏错误提示框
    $('.add-error-info').css("display", "none");
    $('.edit-error-info').css("display", "none");

    $("#jqGrid").jqGrid({
        url: 'http://localhost:8888/user/select',
        datatype: "json",
        colModel: [
            {label: '编号', name: 'id', index: 'sid', width: 50, hidden: true, key: true},
            {label: '用户名', name: 'name', index: 'name', sortable: false, width: 80},
            {label: '类型', name: 'type', index: 'type', sortable: false, width: 80},
            {label: '密码', name: 'password', index: 'password', sortable: false, width: 80},
            {label: '有效', name: 'isDeleted', index: 'isDeleted', sortable: false, width: 80},
            {label: '邮箱', name: 'mail', index: 'mail', sortable: false, width: 80},
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
    if (!validLength(keyword, 20)) {
        swal("搜索字段长度过大!", {
            icon: "error"
        });
        return false;
    }

    //传入查询条件参数
    //点击搜索按钮默认都从第一页开始
    $("#jqGrid").jqGrid("setGridParam", {page: 1,postData:{"key":keyword}});
    //提交post并刷新表格
    $("#jqGrid").jqGrid("setGridParam", {url: 'http://localhost:8888/user/search'}).trigger("reloadGrid");
}



function userEdit() {
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
    //验证数据
    if (validObjectForAdd()) {
        //一切正常后发送网络请求
        //ajax
        var name = $("#username").val();
        var password = $("#userpassword").val();
        var mail = $("#useremail").val();
        var info = $('#information').val();
        var headUrl = $('#img').attr("src");
        var id = $('#id').val();
        var type = $('#type').attr("src");
        var isDelete = $('#isDelete').val();

        var data = {"id":id,"password": password, "mail": mail,
                    "info":info,"name": name, "isDeleted": isDelete,
                    "type": type,"headUrl":headUrl};
        $.ajax({
            type: 'POST',//方法类型
            //dataType: "json",//预期服务器返回的数据类型
            url: 'http://localhost:8888/user/add',//url
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            success: function (result) {
                if (result == '添加成功！') {
                    closeModal();
                    swal(result, {
                        icon: "success"
                    });
                    //reload
                    reload();
                }
                else {
                    closeModal();
                    swal(result, {
                        icon: "error"
                    });
                }
            },
            error: function () {
                reset();
                swal("操作失败", {
                    icon: "error"
                });
            }
        });

    }
});

//绑定modal上的编辑按钮
$('#editButton').click(function () {
    //验证数据
    if (validObjectForEdit()) {
        //一切正常后发送网络请求
        var password = $("#passwordEdit").val();
        var id = $("#id").val();
        var data = {"id": id, "password": password};
        $.ajax({
            type: 'POST',//方法类型
            //dataType: "json",//预期服务器返回的数据类型
            url: 'http://localhost:8888/user/update',//url
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            success: function (result) {
                if (result == '修改成功！') {
                    closeModal();
                    swal(result, {
                        icon: "success"
                    });
                    //reload
                    reload();
                }
                else {
                    closeModal();
                    swal(result, {
                        icon: "error"
                    });
                }
            },
            error: function () {
                reset();
                swal(result.message, {
                    icon: "error"
                });
            }
        });

    }
});



/**
 * 用户删除
 */
function userDel() {
    var ids = getSelectedRows();
    if (ids == null) {
        return;
    }
    swal({
        title: "确认弹框",
        text: "确认要删除数据吗?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    }).then((flag) => {
        if (flag) {
            $.ajax({
                type: "POST",
                url: "http://localhost:8888/user/delete",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(ids),
                success: function (r) {
                    if (r == '删除成功！') {
                        swal("删除成功！", {
                            icon: "success",
                        });
                        $("#jqGrid").trigger("reloadGrid");
                    } else {
                        swal(r, {
                            icon: "error",
                        });
                    }
                }
            });
        }
    });
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
    var userName = $('#username').val();
    if (isNull(userName)) {
        showErrorInfo("用户名不能为空!");
        return false;
    }
    if (!validUserName(userName)) {
        showErrorInfo("请输入符合规范的用户名!");
        return false;
    }
    var password = $('#userpassword').val();
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
    var password = $('#userpassword').val();
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