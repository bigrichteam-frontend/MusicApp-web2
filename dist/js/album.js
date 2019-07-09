$(function () {
    //隐藏弹框
    $('#pictureModal').modal('hide');
    //隐藏错误提示框
    $('.alert-danger').css("display", "none");

    //modal绑定hide事件
    $('#pictureModal').on('hide.bs.modal', function () {
        reset();
    });
    $("#jqGrid").jqGrid({
        url: 'http://localhost:8888/album/select',
        datatype: "json",
        colModel: [
            {label: '歌手id', name: 'sid', index: 'sid', width: 50, sortable: false, hidden: true, key: true},
            {label: '专辑名', name: 'albumName', index: 'albumName', sortable: false, width: 80},
            {label: '语种', name: 'lang', index: 'lang', sortable: false, width: 80},
            {label: '详情', name: 'albumInfo', index: 'albumInfo', sortable: false, width: 160},
            {label: '专辑图片', name: 'headUrl', index: 'headUrl', sortable: false, width: 105, formatter: imgFormatter},
            {label: '创建时间', name: 'releaseDate', index: 'releaseDate', sortable: true, width: 80},
            {label: '有效', name: 'isDeleted', index: 'isDeleted', sortable: true, width: 80}
        ],
        height: 385,
        rowNum: 10,
        rowList: [10, 30, 50],
        styleUI: 'Bootstrap',
        loadtext: '信息读取中...',
        rownumbers: true,
        rownumWidth: 25,
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
        return "<a href='" + cellvalue + "'> <img src='" + cellvalue + "' height=\"120\" width=\"135\" alt='SSM'/></a>";
    }

    new AjaxUpload('#upload', {
        action: 'upload/file',
        name: 'file',
        autoSubmit: true,
        responseType: "json",
        onSubmit: function (file, extension) {
            if (!(extension && /^(jpg|jpeg|png|gif)$/.test(extension.toLowerCase()))) {
                swal('只支持jpg、png、gif格式的文件！', {
                    icon: "error",
                });
                return false;
            }
        },
        onComplete: function (file, r) {
            if (r.resultCode == 200) {
                swal("上传成功", {
                    icon: "success",
                });
                $("#picturePath").val(r.data);
                $("#img").attr("src", r.data);
                $("#img").attr("style", "width: 100px;height: 100px;display:block;");
                return false;
            } else {
                swal(r.message, {
                    icon: "error",
                });
            }
        }
    });

});


function search() {
    //标题关键字
    var keyword = $('#keyword').val();
    if (!validLength(keyword, 20)) {
        swal("搜索字段长度过大!", {
            icon: "error",
        });
        return false;
    }

    //传入查询条件参数
    $("#jqGrid").jqGrid("setGridParam");
    //点击搜索按钮默认都从第一页开始
    $("#jqGrid").jqGrid("setGridParam", {page: 1});
    //提交post并刷新表格
    $("#jqGrid").jqGrid("setGridParam", {url: 'articles/search'}).trigger("reloadGrid");
}

//绑定modal上的保存按钮
$('#saveButton').click(function () {
    //验证数据
    if (validObject()) {
        //一切正常后发送网络请求
        //ajax
        var id = $("#pictureId").val();

        var albumInfo = $('#pictureRemark').val();
        var releaseDate = $('#releaseDate').val();
        var lang = $('#lang').val();
        var albumName = $('#albumName').val();
        var isDeleted = $('#isDeleted').val();
        var headUrl = $('#img').src();
        var data = {"id":id,"albumInfo": albumInfo, "releaseDate": releaseDate,
                    "lang":lang,"albumName": albumName, "isDeleted": isDeleted,
                    "headUrl":headUrl};
        var url = 'http://localhost:8888/album/add';
        //id>0表示编辑操作
        if (id > 0) {
            data = {"id": id, "path": picturePath, "remark": pictureRemark};
            url = 'pictures/update';
        }
        $.ajax({
            type: 'POST',//方法类型
            dataType: "json",//预期服务器返回的数据类型
            url: url,//url
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(data),
            success: function (result) {
                checkResultCode(result.resultCode);
                if (result.resultCode == 200) {
                    $('#pictureModal').modal('hide');
                    swal("保存成功", {
                        icon: "success",
                    });
                    reload();
                }
                else {
                    $('#pictureModal').modal('hide');
                    swal("保存失败", {
                        icon: "error",
                    });
                }
                ;
            },
            error: function () {
                swal("操作失败", {
                    icon: "error",
                });
            }
        });

    }
});

function pictureAdd() {
    reset();
    $('.modal-title').html('专辑添加');
    $('#pictureModal').modal('show');
}

function pictureEdit(){
    reset();
    $('.modal-title').html('专辑编辑');

    var id = getSelectedRow();
    if (id == null) {
        return;
    }
    //请求数据
    $.ajax({
        type: "GET",
        url: "pictures/info/" + id,
        contentType: "application/json",
        beforeSend: function (request) {
            //设置header值
            request.setRequestHeader("token", getCookie("token"));
        },
        success: function (r) {
            checkResultCode(r.resultCode);
            if (r.resultCode == 200 && r.data != null){
                //填充数据至modal
                $('#pictureId').val(r.data.id);
                $('#picturePath').val(r.data.path);
                $('#pictureRemark').val(r.data.remark);
            }
        }
    });
    //显示modal
    $('#pictureModal').modal('show');
}

/**
 * 数据验证
 */
function validObject() {
    var picturePath = $('#picturePath').val();
    if (isNull(picturePath)) {
        showErrorInfo("图片不能为空!");
        return false;
    }
    var pictureRemark = $('#pictureRemark').val();
    if (isNull(pictureRemark)) {
        showErrorInfo("备注信息不能为空!");
        return false;
    }
    if (!validLength(pictureRemark, 150)) {
        showErrorInfo("备注信息长度不能大于150!");
        return false;
    }
    if (!validLength(picturePath, 120)) {
        showErrorInfo("图片上传有误!");
        return false;
    }
    return true;
}

/**
 * 重置
 */
function reset() {
    //隐藏错误提示框
    $('.alert-danger').css("display", "none");
    //清空数据
    $('#pictureId').val(0);
    $('#picturePath').val('');
    $('#pictureRemark').val('');
    $('#releaseDate').val('');
    $('#lang').val('');
    $('#albumName').val('');
    $('#isDeleted').val('');
    $('#sid').val('');
    $('#img').attr('src','');
    $("#img").attr("style", "display:none;");
}

function deletePicture() {
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
                url: "pictures/delete",
                contentType: "application/json",
                beforeSend: function (request) {
                    //设置header值
                    request.setRequestHeader("token", getCookie("token"));
                },
                data: JSON.stringify(ids),
                success: function (r) {
                    checkResultCode(r.resultCode);
                    if (r.resultCode == 200) {
                        swal("删除成功", {
                            icon: "success",
                        });
                        $("#jqGrid").trigger("reloadGrid");
                    } else {
                        swal(r.message, {
                            icon: "error",
                        });
                    }
                }
            });
        }
    });
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