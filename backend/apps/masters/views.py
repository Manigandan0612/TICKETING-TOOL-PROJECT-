from rest_framework import (
    generics,
    permissions,
    viewsets,
)
from rest_framework.permissions import (
    IsAuthenticated,
)
from rest_framework.response import (
    Response,
)

from apps.accounts.permissions import (
    IsAdminOnly,
)

from .models import (
    Department,
    Division,
    Module,
    SubModule,
    ReportedTo,
    EmailConfig,
    ReportedInFormOf,
)

from .serializers import (
    DepartmentSerializer,
    DivisionSerializer,
    ModuleSerializer,
    SubModuleSerializer,
    ReportedToSerializer,
    EmailConfigSerializer,
    EmailConfigWriteSerializer,
    ReportedInFormOfSerializer,
)


# ==========================================
# USER APIs
# ==========================================

class DepartmentListView(
    generics.ListAPIView
):
    queryset = (
        Department.objects
        .filter(is_active=True)
        .order_by(
            'department_name'
        )
    )

    serializer_class = (
        DepartmentSerializer
    )

    permission_classes = [
        IsAuthenticated
    ]


class DivisionListView(
    generics.ListAPIView
):
    queryset = (
        Division.objects
        .filter(is_active=True)
        .order_by(
            'division_name'
        )
    )

    serializer_class = (
        DivisionSerializer
    )

    permission_classes = [
        IsAuthenticated
    ]


class ModuleListView(
    generics.ListAPIView
):
    queryset = (
        Module.objects
        .filter(is_active=True)
        .order_by(
            'module_name'
        )
    )

    serializer_class = (
        ModuleSerializer
    )

    permission_classes = [
        IsAuthenticated
    ]


class SubModuleListView(
    generics.ListAPIView
):
    serializer_class = (
        SubModuleSerializer
    )

    permission_classes = [
        IsAuthenticated
    ]

    # DISABLE PAGINATION
    pagination_class = None

    def get_queryset(self):

        qs = (
            SubModule.objects
            .select_related(
                'module'
            )
            .filter(
                is_active=True
            )
            .order_by(
                'submodule_name'
            )
        )

        module_id = (
            self.request.query_params.get(
                'module'
            )
        )

        if module_id:
            qs = qs.filter(
                module_id=module_id
            )

        return qs


class ReportedToListView(
    generics.ListAPIView
):
    queryset = (
        ReportedTo.objects
        .filter(is_active=True)
        .order_by(
            'person_name'
        )
    )

    serializer_class = (
        ReportedToSerializer
    )

    permission_classes = [
        IsAuthenticated
    ]


class EmailConfigListView(
    generics.ListAPIView
):
    queryset = (
        EmailConfig.objects
        .filter(is_active=True)
        .order_by(
            'config_name'
        )
    )

    serializer_class = (
        EmailConfigSerializer
    )

    permission_classes = [
        IsAuthenticated
    ]


class ReportedInFormOfListView(
    generics.ListAPIView
):
    queryset = (
        ReportedInFormOf.objects
        .filter(is_active=True)
        .order_by('id')
    )

    serializer_class = (
        ReportedInFormOfSerializer
    )

    permission_classes = [
        IsAuthenticated
    ]


# ==========================================
# ADMIN CRUD APIs
# ==========================================

class DepartmentViewSet(
    viewsets.ModelViewSet
):
    queryset = (
        Department.objects
        .all()
        .order_by(
            'department_name'
        )
    )

    serializer_class = (
        DepartmentSerializer
    )

    permission_classes = [
        IsAdminOnly
    ]


class DivisionViewSet(
    viewsets.ModelViewSet
):
    queryset = (
        Division.objects
        .all()
        .order_by(
            'division_name'
        )
    )

    serializer_class = (
        DivisionSerializer
    )

    permission_classes = [
        IsAdminOnly
    ]


class ModuleViewSet(
    viewsets.ModelViewSet
):
    queryset = (
        Module.objects
        .all()
        .order_by(
            'module_name'
        )
    )

    serializer_class = (
        ModuleSerializer
    )

    permission_classes = [
        IsAdminOnly
    ]


class SubModuleViewSet(
    viewsets.ModelViewSet
):
    queryset = (
        SubModule.objects
        .select_related(
            'module'
        )
        .all()
        .order_by(
            'submodule_name'
        )
    )

    serializer_class = (
        SubModuleSerializer
    )

    permission_classes = [
        IsAdminOnly
    ]

    # FORCE NO PAGINATION
    pagination_class = None

    def list(
        self,
        request,
        *args,
        **kwargs
    ):

        queryset = (
            self.get_queryset()
        )

        serializer = (
            self.get_serializer(
                queryset,
                many=True
            )
        )

        return Response(
            serializer.data
        )


class ReportedToViewSet(
    viewsets.ModelViewSet
):
    queryset = (
        ReportedTo.objects
        .all()
        .order_by(
            'person_name'
        )
    )

    serializer_class = (
        ReportedToSerializer
    )

    permission_classes = [
        IsAdminOnly
    ]


class ReportedInFormOfViewSet(
    viewsets.ModelViewSet
):
    queryset = (
        ReportedInFormOf.objects
        .all()
        .order_by('id')
    )

    serializer_class = (
        ReportedInFormOfSerializer
    )

    permission_classes = [
        IsAdminOnly
    ]


class EmailConfigViewSet(
    viewsets.ModelViewSet
):
    queryset = (
        EmailConfig.objects
        .all()
        .order_by(
            'config_name'
        )
    )

    permission_classes = [
        IsAdminOnly
    ]

    def get_serializer_class(
        self
    ):

        if (
            self.request.method
            in [
                'POST',
                'PUT',
                'PATCH'
            ]
        ):
            return (
                EmailConfigWriteSerializer
            )

        return (
            EmailConfigSerializer
        )
